"use client";

// import Link from "next/link"; // Removed unused import
import Image from "next/image";
import {
  Timestamp,
  doc,
  getDoc,
  runTransaction,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebaseConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  // CardDescription, // Removed unused import
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button"; // For potential future actions
import {
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Trash2,
  ArrowUpRightSquare,
} from "lucide-react"; // Example icons
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"; // Import HoverCard components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components for image modal
import { gsap } from "gsap"; // Import GSAP
import { useRouter, usePathname } from "next/navigation"; // Import useRouter and usePathname

// Define the structure of a Post object
export interface Post {
  id: string; // Document ID from Firestore
  title: string;
  description: string;
  link?: string | null;
  imageUrl?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Timestamp; // Keep as Firestore Timestamp initially
  likes: number;
  // Add other fields if needed, like commentCount
}

// Define the structure of a Reply object
interface Reply {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Timestamp;
}

interface PostCardProps {
  post: Post;
  onLikeUpdated?: () => void; // Add callback prop
  onPostDeleted?: (postId: string) => void; // Add callback prop for post deletion
}

// Helper function to format Firestore Timestamps
function formatTimestamp(timestamp: Timestamp): string {
  if (!timestamp) return "Date unknown";
  // More robust formatting can be added using libraries like date-fns
  try {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting timestamp:", timestamp, e);
    // Fallback for potentially non-Timestamp objects during initial load/error
    return "Invalid date";
  }
}

// --- Helper Function to Create Notification ---
// TODO: Move notification creation to Cloud Functions for reliability
const createNotification = async (userId: string, data: object) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    await addDoc(notificationsRef, {
      ...data,
      createdAt: serverTimestamp(),
      read: false,
    });
    console.log("Notification created for user:", userId);
  } catch (error) {
    console.error("Failed to create notification for user:", userId, error);
  }
};

export function PostCard({
  post,
  onLikeUpdated,
  onPostDeleted,
}: PostCardProps) {
  const [user] = useAuthState(auth);
  const pathname = usePathname();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  // --- Add State for Replies ---
  const [replies, setReplies] = useState<Reply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [hasFetchedReplies, setHasFetchedReplies] = useState(false); // Track if fetch has been attempted
  // --- State for Delete Confirmations ---
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [showDeleteReplyConfirm, setShowDeleteReplyConfirm] = useState(false);
  const [replyToDeleteId, setReplyToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // General deleting state
  // --- State for Image Modal ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // --- Ref for Like Button/Icon Animation ---
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  // Determine if currently on a single post page
  const isOnSinglePostPage = pathname?.startsWith("/post/");

  // --- Function to fetch replies (moved before useEffect) ---
  const fetchReplies = useCallback(async () => {
    if (hasFetchedReplies) return; // Don't fetch if already fetched

    console.log(`Fetching replies for post ${post.id}`); // Debug log
    setRepliesLoading(true);
    setHasFetchedReplies(true); // Mark as attempted fetch
    const repliesRef = collection(db, "posts", post.id, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));

    try {
      const querySnapshot = await getDocs(q);
      const fetchedReplies = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as Omit<Reply, "id">),
          } as Reply)
      );
      setReplies(fetchedReplies);
      console.log(
        `Fetched ${fetchedReplies.length} replies for post ${post.id}`
      ); // Debug log
    } catch (error) {
      console.error(`Error fetching replies for post ${post.id}:`, error); // Debug log
      toast.error("Failed to load replies.");
      setShowReplies(false);
      setHasFetchedReplies(false);
    } finally {
      setRepliesLoading(false);
    }
  }, [post.id, hasFetchedReplies]);

  // --- Effect to fetch replies when shown ---
  useEffect(() => {
    if (showReplies && !hasFetchedReplies) {
      fetchReplies();
    }
  }, [showReplies, hasFetchedReplies, fetchReplies]);

  useEffect(() => {
    if (user) {
      const likeRef = doc(db, "posts", post.id, "likes", user.uid);
      getDoc(likeRef).then((docSnap) => {
        setIsLiked(docSnap.exists());
      });
    } else {
      setIsLiked(false);
    }
  }, [user, post.id]);

  // --- Updated handleLike with Optimistic UI & GSAP ---
  const handleLike = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    console.log("Like clicked, propagation stopped."); // Log
    if (!user || isLikeLoading) {
      if (!user) toast.error("You must be logged in to like posts.");
      return;
    }

    // Store previous state for potential rollback
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic UI update
    const newIsLiked = !previousIsLiked;
    const newLikeCount = previousIsLiked
      ? previousLikeCount - 1
      : previousLikeCount + 1;
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount < 0 ? 0 : newLikeCount);
    setIsLikeLoading(true); // Visually disable button during transaction

    // GSAP Animation (runs concurrently with backend update)
    if (likeButtonRef.current) {
      gsap
        .timeline()
        .to(likeButtonRef.current, {
          scale: 1.2,
          duration: 0.15,
          ease: "power1.inOut",
        })
        .to(likeButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)",
        });
    }

    // Backend update
    const postRef = doc(db, "posts", post.id);
    const likeRef = doc(postRef, "likes", user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        // We don't need to get the postDoc just for the count anymore

        if (likeDoc.exists() && previousIsLiked) {
          // Intended to Unlike, and it was liked before optimistic update
          transaction.delete(likeRef);
          transaction.update(postRef, { likes: increment(-1) });
        } else if (!likeDoc.exists() && !previousIsLiked) {
          // Intended to Like, and it was not liked before optimistic update
          transaction.set(likeRef, {
            userId: user.uid,
            likedAt: Timestamp.now(),
          });
          transaction.update(postRef, { likes: increment(1) });
        } else {
          // State mismatch (e.g., double click before UI update) - transaction will rollback implicitly
          console.warn("Like state mismatch during transaction. Rolling back.");
          throw new Error("Like state mismatch");
        }
      });

      // --- Generate Notification on Successful Like (if liking, not unliking) ---
      if (newIsLiked && user.uid !== post.authorId) {
        // Check if liking and not self-liking
        await createNotification(post.authorId, {
          type: "like",
          actorId: user.uid,
          actorName: user.displayName || user.email || "Anonymous",
          actorAvatar: user.photoURL || null,
          postId: post.id,
          postTitleSnippet:
            post.title?.substring(0, 50) ||
            post.description?.substring(0, 50) ||
            "your post",
        });
      }
      // --- End Notification Generation ---

      onLikeUpdated?.();
    } catch (error) {
      console.error("Like transaction failed: ", error);
      toast.error("Failed to update like status.");

      // Rollback optimistic UI update on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      // Re-enable button after transaction attempt
      setIsLikeLoading(false);
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    setReplyText("");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      toast.error("You must be logged in to reply.");
      return;
    }
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    setIsSubmittingReply(true);
    const currentUserId = user.uid;

    const replyData = {
      text: replyText.trim(),
      authorId: currentUserId,
      authorName: user.displayName || user.email || "Anonymous",
      authorAvatar: user.photoURL || null,
      createdAt: serverTimestamp(),
    };

    console.log(
      "Attempting to submit reply:",
      JSON.stringify(replyData, null, 2)
    );

    try {
      const newReplyRef = await addDoc(
        collection(db, "posts", post.id, "replies"),
        replyData
      );
      toast.success("Reply posted!");

      // Optimistic UI update for reply list
      const newReply: Reply = {
        id: newReplyRef.id, // Get the ID of the new reply
        ...(replyData as Omit<Reply, "id" | "createdAt">),
        createdAt: Timestamp.now(),
      };
      setReplies((prevReplies) => [...prevReplies, newReply]);
      if (!showReplies) {
        setShowReplies(true);
        if (!hasFetchedReplies) setHasFetchedReplies(true);
      }

      // Generate Notification on Successful Reply
      if (user.uid !== post.authorId) {
        await createNotification(post.authorId, {
          type: "reply",
          actorId: user.uid,
          actorName: user.displayName || user.email || "Anonymous",
          actorAvatar: user.photoURL || null,
          postId: post.id,
          postTitleSnippet:
            post.title?.substring(0, 50) ||
            post.description?.substring(0, 50) ||
            "your post",
          replyTextSnippet: replyData.text.substring(0, 75),
          replyId: newReplyRef.id, // Add the ID of the reply document
        });
      }
      // ... rest of try ...

      setReplyText("");
      setShowReplyInput(false);
    } catch (error: unknown) {
      console.error("Error posting reply raw:", error);

      let errorMessage: string | undefined = undefined;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "An unknown error occurred while posting reply.";
      }

      console.error(`Error posting reply: ${errorMessage}`);
      toast.error("Failed to post reply.", { description: errorMessage });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleRepliesVisibility = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    console.log("Toggle replies clicked, propagation stopped."); // Log
    const newState = !showReplies;
    setShowReplies(newState);
    if (newState && !hasFetchedReplies) {
      fetchReplies();
    }
  };

  // --- Delete Handlers ---
  const handleDeletePostClick = () => {
    setShowDeletePostConfirm(true);
  };

  const handleConfirmDeletePost = async () => {
    if (!user || user.uid !== post.authorId) {
      toast.error("You are not authorized to delete this post.");
      setShowDeletePostConfirm(false);
      return;
    }
    setIsDeleting(true);
    try {
      // TODO: Ideally, use a Cloud Function to delete subcollections (likes, replies)
      // Client-side deletion of subcollections is possible but less reliable.
      // For now, just delete the post document.
      const postRef = doc(db, "posts", post.id);
      await deleteDoc(postRef);
      toast.success("Post deleted successfully.");
      onPostDeleted?.(post.id); // Notify parent to update UI
      // No need to close dialog here, state change handles it
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.");
    } finally {
      setIsDeleting(false);
      setShowDeletePostConfirm(false);
    }
  };

  const handleDeleteReplyClick = (replyId: string) => {
    setReplyToDeleteId(replyId);
    setShowDeleteReplyConfirm(true);
  };

  const handleConfirmDeleteReply = async () => {
    if (!user || !replyToDeleteId) {
      setShowDeleteReplyConfirm(false);
      return;
    }

    const replyToDelete = replies.find((r) => r.id === replyToDeleteId);
    if (!replyToDelete) {
      setShowDeleteReplyConfirm(false);
      return; // Reply not found
    }

    // Check authorization (reply author or post author)
    if (user.uid !== replyToDelete.authorId && user.uid !== post.authorId) {
      toast.error("You are not authorized to delete this reply.");
      setShowDeleteReplyConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      const replyRef = doc(db, "posts", post.id, "replies", replyToDeleteId);
      await deleteDoc(replyRef);

      // Optimistic UI update
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== replyToDeleteId)
      );

      toast.success("Reply deleted successfully.");
      setReplyToDeleteId(null);
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply.");
    } finally {
      setIsDeleting(false);
      setShowDeleteReplyConfirm(false);
    }
  };

  // --- Navigation Handler ---
  const handleOpenPost = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <>
      <Card className="overflow-hidden break-inside-avoid mb-6">
        <CardHeader className="flex flex-row items-start space-x-4 pb-2 relative">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <Avatar className="h-10 w-10 border cursor-pointer">
                <AvatarImage
                  src={post.authorAvatar || undefined}
                  alt={`${post.authorName || "User"}'s avatar`}
                />
                <AvatarFallback>
                  {post.authorName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={post.authorAvatar || undefined}
                    alt={`${post.authorName || "User"}'s avatar`}
                  />
                  <AvatarFallback>
                    {post.authorName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {post.authorName || "Anonymous"}
                  </p>
                  {/* Placeholder for username - Update if username field is added to Post interface */}
                  {/* <p className="text-sm text-muted-foreground">
                    @username_placeholder
                  </p> */}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-none">
              {post.authorName || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(post.createdAt)}
            </p>
          </div>
          {/* Post Delete Button (only for author) */}
          {user && user.uid === post.authorId && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeletePostClick}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Post</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          {/* Reordered Content */}
          {/* 1. Link Button */}
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline inline-flex items-center group break-all mb-3"
            >
              <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0 group-hover:text-blue-700" />
              <span className="truncate">{post.link}</span>
            </a>
          )}
          {/* 2. Title */}
          {post.title && (
            <CardTitle className="text-lg mb-2 font-semibold">
              {post.title}
            </CardTitle>
          )}
          {/* 3. Description */}
          {post.description && (
            <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
              {post.description}
            </p>
          )}
          {/* 4. Image */}
          {post.imageUrl && (
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
              <DialogTrigger asChild>
                <div className="relative w-full aspect-video rounded-md overflow-hidden my-3 border cursor-pointer group">
                  <Image
                    src={post.imageUrl}
                    alt={post.title || "Post image"}
                    layout="fill"
                    objectFit="contain"
                    className="bg-black/10 group-hover:opacity-90 transition-opacity"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-2 sm:p-4 bg-background border-none shadow-xl">
                <DialogTitle className="sr-only">
                  {post.title || "Post Image"}
                </DialogTitle>
                <div className="relative w-full h-auto max-h-[85vh] flex justify-center items-center">
                  <Image
                    src={post.imageUrl}
                    alt={post.title || "Post image"}
                    width={1200}
                    height={900}
                    className="max-w-full max-h-full h-auto w-auto object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-3 border-t pt-3 pb-3 bg-muted/50">
          <div className="flex justify-start items-center space-x-4 w-full">
            <Button
              ref={likeButtonRef}
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:text-primary px-2 ${
                isLiked ? "text-blue-600 hover:text-blue-700" : ""
              }`}
              onClick={handleLike}
              disabled={isLikeLoading || !user}
            >
              <ThumbsUp
                className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`}
              />{" "}
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleReplyClick();
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" /> Reply
            </Button>
            {/* Conditionally render Open Post Button */}
            {!isOnSinglePostPage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary px-2"
                onClick={handleOpenPost}
              >
                <ArrowUpRightSquare className="h-4 w-4 mr-1.5" /> Open
              </Button>
            )}
            {/* Show/Hide Replies Button */}
            <Button
              variant="ghost"
              size="sm"
              // Adjust margin based on whether Open button is present
              className={`text-muted-foreground hover:text-primary px-2 ${
                !isOnSinglePostPage ? "" : "ml-auto"
              }`}
              onClick={toggleRepliesVisibility}
              disabled={repliesLoading}
            >
              {showReplies
                ? `Hide Replies (${replies.length})`
                : "Show Replies"}
            </Button>
          </div>
          {showReplyInput && (
            <form
              onSubmit={handleReplySubmit}
              className="w-full pt-2 pl-1 pr-1 space-y-2"
            >
              <Textarea
                placeholder={`Replying as ${
                  user?.displayName || user?.email || "user"
                }...`}
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isSubmittingReply || isDeleting}
                className="text-sm"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyInput(false)}
                  disabled={isSubmittingReply || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSubmittingReply || !replyText.trim() || isDeleting
                  }
                >
                  {isSubmittingReply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          )}
          {showReplies && (
            <div className="w-full pt-3 mt-3 border-t border-border/50">
              {repliesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground">
                    Loading replies...
                  </p>
                </div>
              ) : replies.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">
                  No replies yet.
                </p>
              ) : (
                <div className="space-y-3 pl-1 pr-1 max-h-60 overflow-y-auto">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      id={`reply-${reply.id}`} // Add unique ID for scrolling
                      className="flex items-start space-x-3 text-sm group relative"
                    >
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <Avatar className="h-6 w-6 border mt-0.5 cursor-pointer">
                            <AvatarImage
                              src={reply.authorAvatar || undefined}
                              alt={`${reply.authorName || "User"}'s avatar`}
                            />
                            <AvatarFallback>
                              {reply.authorName?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={reply.authorAvatar || undefined}
                                alt={`${reply.authorName || "User"}'s avatar`}
                              />
                              <AvatarFallback>
                                {reply.authorName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-base font-semibold">
                                {reply.authorName || "Anonymous"}
                              </p>
                              {/* Placeholder for username - Update if username field is added to Reply interface */}
                              {/* <p className="text-xs text-muted-foreground">@username_placeholder</p> */}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <div className="flex-1 bg-background/50 p-2 rounded-md">
                        <div className="flex items-baseline justify-between">
                          <span className="font-medium text-xs">
                            {reply.authorName || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground pr-2">
                            {formatTimestamp(reply.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap">{reply.text}</p>
                      </div>
                      {/* Reply Delete Button (reply author or post author) */}
                      {user &&
                        (user.uid === reply.authorId ||
                          user.uid === post.authorId) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteReplyClick(reply.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete Reply</span>
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog
        open={showDeletePostConfirm}
        onOpenChange={setShowDeletePostConfirm}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              post and all associated replies and likes. (Note: Subcollection
              deletion may require manual cleanup or a Cloud Function for
              completeness).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Reply Confirmation Dialog */}
      <AlertDialog
        open={showDeleteReplyConfirm}
        onOpenChange={setShowDeleteReplyConfirm}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this reply?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteReply}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Reply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
