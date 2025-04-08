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
import Image from "next/image";
import { Search, PenSquare, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  // --- Handler for Post Deletion ---
  const handlePostDeleted = (deletedPostId: string) => {
    console.log("Removing deleted post from UI:", deletedPostId); // Debug Log
    setExplorePosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== deletedPostId)
    );
    setMyPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== deletedPostId)
    );
  };

  // --- Filter Logic ---
  const filterPosts = (posts: Post[]): Post[] => {
    if (!searchTerm) {
      return posts; // No search term, return all posts
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.authorName?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  };

  const filteredExplorePosts = filterPosts(explorePosts);
  const filteredMyPosts = filterPosts(myPosts);

  // --- Render Logic ---

  // First, handle the absolute loading state from useAuthState
  if (authLoading) {
    // Consistent Loading state for Server and Initial Client Render
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Image
          src="/retro-loader.gif"
          alt="Loading..."
          width={250}
          height={250}
          unoptimized={true}
          priority
        />
        <p className="mt-4 text-lg text-muted-foreground font-semibold animate-pulse">
          Loading Hub...
        </p>
      </div>
    );
  }

  // Auth is no longer loading, check for errors
  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {authError.message}
      </div>
    );
  }

  // Auth is loaded, no error, but check if user is null (not logged in)
  if (!user) {
    // The useEffect hook handles the redirect, but we need to render something
    // consistent (or null) while waiting for the redirect.
    // Returning null is often safest for hydration.
    // Alternatively, show a generic "Redirecting..." which matches server render if applicable.
    return null; // Or return the Redirecting message if preferred and consistent
    // return (
    //   <div className="flex justify-center items-center min-h-screen">
    //     Redirecting to login...
    //   </div>
    // );
  }

  // If we reach here: authLoading is false, authError is null, user exists.
  // Render the main Fan Hub content.
  return (
    <motion.div
      className="container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-grow"
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
            <CreatePostDialog onPostCreated={fetchPosts} />
          </div>
        </div>

        {/* --- Retro Banner --- */}
        <div className="relative w-full aspect-[4/1] mb-8 overflow-hidden rounded-lg shadow-lg">
          <Image
            src="/fan-hub-banner.jpg"
            alt="Fan Hub Retro Banner"
            layout="fill"
            objectFit="cover"
            unoptimized={true}
            priority
          />
        </div>

        <Separator className="mb-8 border-dashed border-muted-foreground/50" />

        {/* --- Search Bar --- */}
        <div className="mb-6 relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts by title, description, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-input"
          />
        </div>

        {/* Tabs Layout - Updated Styling */}
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted/60 p-1 text-muted-foreground mb-6 w-full sm:w-auto gap-1 border border-border/50 shadow-inner">
            <TabsTrigger
              value="explore"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:font-semibold hover:text-primary"
            >
              🚀 Explore
            </TabsTrigger>
            <TabsTrigger
              value="my-posts"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:font-semibold hover:text-primary"
            >
              👤 My Posts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explore">
            <div className="space-y-0">
              {explorePostsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : filteredExplorePosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg bg-muted/30">
                  <Search className="w-16 h-16 text-muted-foreground/70 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground/90">
                    {searchTerm
                      ? "No Matching Posts Found"
                      : "The Hub is Quiet..."}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? `Try adjusting your search for "${searchTerm}".`
                      : "Be the first to share something cool!"}
                  </p>
                </div>
              ) : (
                filteredExplorePosts.map((post) => (
                  <Link
                    href={`/post/${post.id}`}
                    key={`explore-${post.id}`}
                    className="block mb-6 last:mb-0"
                  >
                    <PostCard
                      post={post}
                      onLikeUpdated={fetchPosts}
                      onPostDeleted={handlePostDeleted}
                    />
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="my-posts">
            <div className="space-y-0">
              {myPostsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : filteredMyPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg bg-muted/30">
                  <PenSquare className="w-16 h-16 text-muted-foreground/70 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground/90">
                    {searchTerm
                      ? "No Matching Posts Found"
                      : "Your Space Awaits!"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? `Try adjusting your search for "${searchTerm}".`
                      : 'Click "Create New Post" to share your first thought.'}
                  </p>
                </div>
              ) : (
                filteredMyPosts.map((post) => (
                  <Link
                    href={`/post/${post.id}`}
                    key={`my-${post.id}`}
                    className="block mb-6 last:mb-0"
                  >
                    <PostCard
                      post={post}
                      onLikeUpdated={fetchPosts}
                      onPostDeleted={handlePostDeleted}
                    />
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
