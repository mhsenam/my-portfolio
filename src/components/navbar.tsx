"use client"; // Add this directive

import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { ModeToggle } from "./theme-toggle"; // Import the toggle
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState
import { signOut } from "firebase/auth"; // Import signOut
import { auth, db } from "../lib/firebaseConfig"; // Trying path relative to src
import { Button } from "@/components/ui/button"; // Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Import Popover
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar for notifications
import { Menu, Bell } from "lucide-react"; // Import Bell icon
import { useState, useEffect } from "react"; // Import hooks
import {
  collection,
  query,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"; // Import Firestore functions
import { toast } from "sonner"; // Import toast
import { formatDistanceToNow } from "date-fns"; // Import date-fns

// --- Notification Type ---
interface Notification {
  id: string;
  type: "like" | "reply";
  actorId: string;
  actorName: string;
  actorAvatar?: string | null;
  postId: string;
  postTitleSnippet?: string;
  replyTextSnippet?: string;
  replyId?: string; // Ensure replyId is optional
  createdAt: Timestamp;
  read: boolean;
}

export function Navbar() {
  const [user /* , loading */] = useAuthState(auth);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) {
      setIsLoadingNotifications(true);
      const notificationsRef = collection(
        db,
        "users",
        user.uid,
        "notifications"
      );
      // Order by creation time, newest first, limit to recent ones
      const q = query(
        notificationsRef,
        orderBy("createdAt", "desc"),
        limit(15)
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedNotifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Notification, "id">),
          }));
          setNotifications(fetchedNotifications);
          // Calculate unread count
          setUnreadCount(fetchedNotifications.filter((n) => !n.read).length);
          setIsLoadingNotifications(false);
        },
        (error) => {
          console.error("Error fetching notifications: ", error);
          setIsLoadingNotifications(false);
        }
      );

      // Cleanup listener on component unmount or user change
      return () => unsubscribe();
    } else {
      // Clear notifications if user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Simplified hover effect (optional)
  const linkClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";
  const mobileLinkClasses =
    "text-base font-medium cursor-pointer w-full text-left"; // Ensure items take full width and text is aligned left

  const navLinks = (
    <>
      <Link href="/articles" className={linkClasses}>
        My Articles
      </Link>
      <Link href="/fan-hub" className={linkClasses}>
        Fan Hub
      </Link>
      {user && (
        <>
          <Link href="/profile" className={linkClasses}>
            Profile
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={`${linkClasses} px-0`} // Align style
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </>
      )}
    </>
  );

  // --- Mark Notification as Read ---
  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    console.log("Marking notification as read:", notificationId);
    const notificationRef = doc(
      db,
      "users",
      user.uid,
      "notifications",
      notificationId
    );
    try {
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read.");
    }
  };

  // --- Mark All Notifications as Read ---
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    console.log(
      `Marking ${unreadNotifications.length} notifications as read...`
    );
    const batch = writeBatch(db);
    unreadNotifications.forEach((n) => {
      const notificationRef = doc(db, "users", user.uid, "notifications", n.id);
      batch.update(notificationRef, { read: true });
    });

    try {
      await batch.commit();
      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read.");
    }
  };

  // --- Updated NotificationItem ---
  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const href = `/post/${notification.postId}${
      notification.type === "reply" && notification.replyId
        ? `?replyId=${notification.replyId}`
        : ""
    }`;

    const handleClick = () => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    };

    return (
      <Link href={href} className="block" onClick={handleClick}>
        <div
          className={`flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md ${
            !notification.read ? "bg-primary/5" : ""
          }`}
        >
          <Avatar className="h-8 w-8 mt-0.5">
            <AvatarImage src={notification.actorAvatar || undefined} />
            <AvatarFallback>
              {notification.actorName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium">
              {notification.actorName}{" "}
              <span className="text-muted-foreground font-normal">
                {notification.type === "like" && "liked your post"}
                {notification.type === "reply" && "replied to your post"}
              </span>
            </p>
            {notification.type === "like" && notification.postTitleSnippet && (
              <p className="text-muted-foreground italic text-xs mt-0.5">
                ↳ &ldquo;{notification.postTitleSnippet}...&rdquo;
              </p>
            )}
            {notification.type === "reply" && notification.replyTextSnippet && (
              <p className="text-muted-foreground italic text-xs mt-0.5">
                ↳ &ldquo;{notification.replyTextSnippet}...&rdquo;
              </p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {notification.createdAt
                ? formatDistanceToNow(notification.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : "..."}
            </p>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full self-center flex-shrink-0"></div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Mohsen Amini
        </Link>

        {/* Desktop Navigation (Hidden on smaller screens) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks} {/* Use the extracted links */}
          {/* --- Notification Bell (Desktop) --- */}
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-medium leading-none">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      Loading...
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No new notifications.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))
                  )}
                </div>
                {/* Mark All Read Button */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full h-auto py-1.5 text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Navigation (Visible on smaller screens) using DropdownMenu */}
        <div className="md:hidden flex items-center space-x-2">
          {/* --- Notification Bell (Mobile) - Consider adding here or in menu --- */}
          {user && (
            // Simple version for mobile - could integrate into dropdown too
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                {/* (Content same as desktop version) */}
                <div className="p-4 border-b">
                  <h4 className="font-medium leading-none">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      Loading...
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No new notifications.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))
                  )}
                </div>
                {/* Mark All Read Button */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full h-auto py-1.5 text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-center font-semibold">
                Navigation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className={mobileLinkClasses}>
                <Link href="/articles">My Articles</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={mobileLinkClasses}>
                <Link href="/fan-hub">Fan Hub</Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className={mobileLinkClasses}>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={mobileLinkClasses}
                  >
                    Log Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
