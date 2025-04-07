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
} from "firebase/firestore";
import { useState, useEffect } from "react";
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
import { ExternalLink, MessageSquare, ThumbsUp } from "lucide-react"; // Example icons
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

export function PostCard({ post, onLikeUpdated }: PostCardProps) {
  const [user] = useAuthState(auth);
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

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts.");
      return;
    }
    setIsLikeLoading(true);

    const postRef = doc(db, "posts", post.id);
    const likeRef = doc(postRef, "likes", user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        const postDoc = await transaction.get(postRef);

        if (!postDoc.exists()) {
          throw "Post does not exist anymore.";
        }

        const currentLikes = postDoc.data().likes || 0;

        if (likeDoc.exists()) {
          transaction.delete(likeRef);
          transaction.update(postRef, { likes: increment(-1) });
          setIsLiked(false);
          setLikeCount(currentLikes - 1 < 0 ? 0 : currentLikes - 1);
        } else {
          transaction.set(likeRef, {
            userId: user.uid,
            likedAt: Timestamp.now(),
          });
          transaction.update(postRef, { likes: increment(1) });
          setIsLiked(true);
          setLikeCount(currentLikes + 1);
        }
        onLikeUpdated?.();
      });
    } catch (error) {
      console.error("Like transaction failed: ", error);
      toast.error("Failed to update like status.");
    } finally {
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
    const repliesRef = collection(db, "posts", post.id, "replies");

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
      await addDoc(repliesRef, replyData);
      toast.success("Reply posted!");
      setReplyText("");
      setShowReplyInput(false);
    } catch (error: unknown) {
      console.error("Error posting reply raw:", error);

      let errorCode: string | undefined = undefined;
      let errorMessage: string | undefined = undefined;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Attempt to access Firebase specific 'code' property safely
        if (typeof error === "object" && error !== null && "code" in error) {
          // We know 'code' exists, but TS might not, so cast carefully if needed or access via index
          try {
            errorCode = (error as { code: string }).code;
          } catch {
            /* ignore casting error */
          }
        }
      } else {
        errorMessage = "An unknown error occurred while posting reply.";
      }

      console.error(
        `Firebase Error Code: ${errorCode || "N/A"}, Message: ${
          errorMessage || "N/A"
        }`
      );
      toast.error("Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // --- Function to fetch replies ---
  const fetchReplies = async () => {
    if (!showReplies || hasFetchedReplies) return; // Don't fetch if already fetched or not showing

    setRepliesLoading(true);
    setHasFetchedReplies(true); // Mark as attempted fetch
    const repliesRef = collection(db, "posts", post.id, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc")); // Order replies oldest first

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
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast.error("Failed to load replies.");
      setShowReplies(false); // Hide replies section on error
      setHasFetchedReplies(false); // Allow refetch attempt
    } finally {
      setRepliesLoading(false);
    }
  };

  // --- Function to toggle reply visibility and fetch ---
  const toggleRepliesVisibility = () => {
    const newState = !showReplies;
    setShowReplies(newState);
    // Fetch only when opening and if not fetched before
    if (newState && !hasFetchedReplies) {
      fetchReplies();
    } else if (!newState) {
      // Optional: Clear replies when hiding
      // setReplies([]);
      // setHasFetchedReplies(false);
    }
  };

  return (
    <Card className="overflow-hidden break-inside-avoid mb-6">
      {" "}
      {/* Added margin-bottom */}
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={post.authorAvatar || undefined}
            alt={`${post.authorName || "User"}'s avatar`}
          />
          <AvatarFallback>
            {post.authorName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-none">
            {post.authorName || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(post.createdAt)}
          </p>
        </div>
        {/* Optional: Add dropdown menu for edit/delete here */}
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {" "}
        {/* Adjusted padding */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video rounded-md overflow-hidden my-3 border">
            <Image
              src={post.imageUrl}
              alt={post.title || "Post image"}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        {post.title && (
          <CardTitle className="text-lg mb-2 font-semibold">
            {post.title}
          </CardTitle>
        )}
        {post.description && (
          <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
            {post.description}
          </p>
        )}
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline inline-flex items-center group break-all"
          >
            <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0 group-hover:text-blue-700" />
            {/* Try to display a shorter version of the link */}
            <span className="truncate">{post.link}</span>
          </a>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-3 border-t pt-3 pb-3 bg-muted/50">
        <div className="flex justify-start space-x-4 w-full">
          <Button
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
            onClick={handleReplyClick}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" /> Reply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary px-2 ml-auto"
            onClick={toggleRepliesVisibility}
            disabled={repliesLoading}
          >
            {showReplies ? "Hide Replies" : "Show Replies"}
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
              disabled={isSubmittingReply}
              className="text-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(false)}
                disabled={isSubmittingReply}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReply || !replyText.trim()}
              >
                {isSubmittingReply ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </form>
        )}
        {showReplies && (
          <div className="w-full pt-3 border-t border-border/50">
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
                    className="flex items-start space-x-3 text-sm"
                  >
                    <Avatar className="h-6 w-6 border mt-0.5">
                      <AvatarImage
                        src={reply.authorAvatar || undefined}
                        alt={`${reply.authorName || "User"}'s avatar`}
                      />
                      <AvatarFallback>
                        {reply.authorName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-background/50 p-2 rounded-md">
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium text-xs">
                          {reply.authorName || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(reply.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
