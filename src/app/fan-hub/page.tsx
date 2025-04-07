"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebaseConfig"; // Corrected path
import { motion } from "framer-motion"; // Import motion
// import { Button } from "@/components/ui/button"; // Removed unused Button import
import { Separator } from "@/components/ui/separator"; // Import Separator
import { CreatePostDialog } from "@/components/create-post-dialog"; // Import the new component

export default function FanHubPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user exists, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading indicator while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error message if authentication check failed
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // If user is logged in, show the Fan Hub content
  if (user) {
    return (
      <motion.div
        className="container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30" // Added pt, pb, min-h, flex, background
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Fan Hub
              </h1>
              <p className="text-muted-foreground">
                Welcome, {user.displayName || user.email}! Share your thoughts.
              </p>
            </div>
            <CreatePostDialog
              onPostCreated={() => {
                // TODO: Implement post refetching logic here
                console.log("Post created! Need to refetch posts.");
              }}
            />
          </div>
          <Separator className="mb-8" />

          {/* Placeholder for Posts */}
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              No posts yet. Be the first to create one!
            </p>
            {/* TODO: Fetch and display posts here */}
            {/* Example Post Card (Placeholder) */}
            <div className="p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Example Post Title</h3>
              <p className="text-sm text-muted-foreground">
                This is placeholder content for a fan post...
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Fallback if none of the above conditions are met (shouldn't happen often)
  return null;
}
