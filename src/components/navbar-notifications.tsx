"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
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
} from "firebase/firestore";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebaseConfig";

/**
 * Notification bell + dropdown.
 *
 * Lives in its own chunk (loaded with next/dynamic, ssr:false) so Firestore,
 * sonner and date-fns are downloaded only for signed-in users who actually
 * open the bell — not on every route's first paint.
 */

interface Notification {
  id: string;
  type: "like" | "reply";
  actorId: string;
  actorName: string;
  actorAvatar?: string | null;
  postId: string;
  postTitleSnippet?: string;
  replyTextSnippet?: string;
  replyId?: string;
  createdAt: Timestamp;
  read: boolean;
}

export function NotificationsBell({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    setIsLoadingNotifications(true);
    const notificationsRef = collection(
      db,
      "users",
      user.uid,
      "notifications"
    );
    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(15)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedNotifications = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Notification, "id">),
        }));
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n) => !n.read).length);
        setIsLoadingNotifications(false);
      },
      (error) => {
        console.error("Error fetching notifications: ", error);
        setIsLoadingNotifications(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markNotificationAsRead = async (notificationId: string) => {
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

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach((n) => {
      const notificationRef = doc(
        db,
        "users",
        user.uid,
        "notifications",
        n.id
      );
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

  const NotificationItem = ({ notification }: { notification: Notification }) => {
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
  );
}
