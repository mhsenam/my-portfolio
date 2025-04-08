"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { PostCard, Post } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SinglePostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = params.postId as string;
  const replyIdToScroll = searchParams.get("replyId");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError("Post ID is missing.");
      setLoading(false);
      return;
    }

    console.log(`Fetching post data for ID: ${postId}`);

    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          console.log("Post data found:", postSnap.data());
          setPost({ id: postSnap.id, ...postSnap.data() } as Post);
        } else {
          console.error("Post not found in Firestore.");
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  // Effect to scroll to reply
  useEffect(() => {
    // Only run scroll effect after loading is complete and post is available
    if (replyIdToScroll && post && !loading) {
      console.log(`Attempting to scroll to reply ID: ${replyIdToScroll}`);
      // Delay slightly to allow PostCard and its internal reply fetching/rendering to potentially complete
      const scrollTimeout = setTimeout(() => {
        const elementId = `reply-${replyIdToScroll}`;
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`Scrolling to element: ${elementId}`);
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight effect
          element.classList.add(
            "ring-2",
            "ring-primary",
            "ring-offset-background",
            "ring-offset-2",
            "rounded-md",
            "transition-all",
            "duration-1000",
            "ease-out"
          );
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-primary",
              "ring-offset-background",
              "ring-offset-2",
              "rounded-md",
              "transition-all",
              "duration-1000",
              "ease-out"
            );
          }, 3000); // Remove highlight after 3 seconds
        } else {
          console.warn(
            `Reply element with ID ${elementId} not found after delay. PostCard might need more time or reply doesn't exist.`
          );
        }
      }, 700); // Increased delay slightly

      return () => clearTimeout(scrollTimeout); // Cleanup timeout on unmount/rerun
    }
  }, [replyIdToScroll, post, loading]);

  // --- Render states ---
  const renderContent = () => {
    if (loading) {
      // Simple loading skeleton for the single post view
      return (
        <div className="space-y-3 p-4 border rounded-lg bg-card mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4 mt-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-[200px] w-full rounded-md mt-3" />
          <div className="flex space-x-4 pt-3">
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-destructive py-10">{error}</div>;
    }

    if (!post) {
      return (
        <div className="text-center text-muted-foreground py-10">
          Post could not be loaded.
        </div>
      );
    }

    // Render the PostCard - it will handle fetching its own replies
    // Pass dummy callbacks as they might not be relevant on this page
    return (
      <PostCard
        post={post}
        onLikeUpdated={() => {}}
        onPostDeleted={() => {
          console.log("Post deleted, redirecting to /fan-hub");
          router.push("/fan-hub");
        }}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 min-h-screen">
      {renderContent()}
    </div>
  );
}
