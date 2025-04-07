"use client";

// import Link from "next/link"; // Removed unused import
import Image from "next/image";
import {
  Timestamp,
  doc,
  getDoc,
  runTransaction,
  increment,
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
      <CardFooter className="flex flex-col items-start space-y-2 border-t pt-3 pb-3 bg-muted/50">
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
        </div>
        {showReplyInput && (
          <div className="w-full pt-2 pl-1 pr-1">
            <p className="text-xs text-muted-foreground">
              Replying to this post... (UI placeholder)
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
