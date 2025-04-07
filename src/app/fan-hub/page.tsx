"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { PostCard, Post } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to create placeholder skeletons
const PostSkeleton = () => (
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

export default function FanHubPage() {
  const [user, authLoading, authError] = useAuthState(auth);
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(true);
  const [explorePostsLoading, setExplorePostsLoading] = useState(true);

  // Fetching Logic
  const fetchPosts = useCallback(async () => {
    // Fetch explore posts first (everyone sees these)
    setExplorePostsLoading(true);
    try {
      const postsRef = collection(db, "posts");
      const qExplorePosts = query(
        postsRef,
        orderBy("createdAt", "desc"),
        limit(20)
      ); // Limit explore posts
      const exploreSnapshot = await getDocs(qExplorePosts);
      const fetchedExplorePosts = exploreSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">), // Type assertion
      }));
      setExplorePosts(fetchedExplorePosts);
      // console.log("Fetched Explore Posts Data:", fetchedExplorePosts); // Optional Debug Log
    } catch (err) {
      console.error("Error fetching explore posts:", err);
      // Handle error state appropriately, maybe show a toast
    } finally {
      setExplorePostsLoading(false);
    }

    // Fetch user-specific posts only if logged in
    if (user) {
      setMyPostsLoading(true);
      try {
        const postsRef = collection(db, "posts");
        const qMyPosts = query(
          postsRef,
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        ); // Limit my posts
        const mySnapshot = await getDocs(qMyPosts);
        const fetchedMyPosts = mySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Post, "id">), // Type assertion
        }));
        setMyPosts(fetchedMyPosts);
        // console.log("Fetched My Posts Data:", fetchedMyPosts); // Optional Debug Log
      } catch (err) {
        console.error("Error fetching my posts:", err);
        if (err instanceof Error && err.message.includes("index")) {
          console.error(
            "Firestore index potentially missing for fetching user posts (authorId + createdAt)"
          );
          // Add user-friendly error feedback here if needed
        }
      } finally {
        setMyPostsLoading(false);
      }
    } else {
      setMyPosts([]); // Clear myPosts if user logs out
      setMyPostsLoading(false);
    }
  }, [user]); // Depend on user object

  // Initial Fetch and Refetch Trigger
  useEffect(() => {
    if (!authLoading) {
      // Ensure auth state is resolved before fetching
      fetchPosts();
    }
  }, [authLoading, fetchPosts]); // Rerun when auth state changes or fetchPosts changes (due to user dependency)

  // Redirect if not logged in (after auth check)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // --- Render Logic ---
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Authentication...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {authError.message}
      </div>
    );
  }

  // User is definitely logged in at this point due to redirect effect
  if (!user) {
    // Should ideally not be reached if redirect works, but acts as a safeguard
    return (
      <div className="flex justify-center items-center min-h-screen">
        Redirecting to login...
      </div>
    );
  }

  // Log state before rendering columns
  console.log("Current 'My Posts' state:", myPosts);
  console.log("Current 'Explore Posts' state:", explorePosts);
  console.log("Loading states:", { myPostsLoading, explorePostsLoading });

  return (
    <motion.div
      className="container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col" // Removed gradient for focus
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-grow" // Allow content to grow
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Fan Hub</h1>
            <p className="text-muted-foreground">
              Welcome, {user.displayName || user.email}! Share your thoughts.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {" "}
            {/* Ensure button doesn't overlap on small screens */}
            {/* Update the onPostCreated prop to call fetchPosts */}
            <CreatePostDialog onPostCreated={fetchPosts} />
          </div>
        </div>
        <Separator className="mb-8" />

        {/* Tabs Layout */}
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            {" "}
            {/* Tab Triggers */}
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          {/* Explore Tab Content */}
          <TabsContent value="explore">
            <div className="space-y-0">
              {" "}
              {/* Container for explore posts */}
              {explorePostsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : explorePosts.length === 0 ? (
                <p className="text-center text-muted-foreground pt-4">
                  No posts to explore yet.
                </p>
              ) : (
                explorePosts.map((post) => (
                  <PostCard
                    key={`explore-${post.id}`}
                    post={post}
                    onLikeUpdated={fetchPosts}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* My Posts Tab Content */}
          <TabsContent value="my-posts">
            <div className="space-y-0">
              {" "}
              {/* Container for my posts */}
              {myPostsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : myPosts.length === 0 ? (
                <p className="text-center text-muted-foreground pt-4">
                  You haven&apos;t created any posts yet.
                </p>
              ) : (
                myPosts.map((post) => (
                  <PostCard
                    key={`my-${post.id}`}
                    post={post}
                    onLikeUpdated={fetchPosts}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
