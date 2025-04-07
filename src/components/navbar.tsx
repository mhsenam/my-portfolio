"use client"; // Add this directive

import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { ModeToggle } from "./theme-toggle"; // Import the toggle
import { motion } from "framer-motion"; // Import motion
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "../lib/firebaseConfig"; // Trying path relative to src
import { Button } from "@/components/ui/button"; // Import Button

export function Navbar() {
  const [user, loading] = useAuthState(auth); // Get user state
  const router = useRouter();
  const hoverEffect = {
    scale: 1.1, // Scale up on hover
    // color: "hsl(var(--primary))", // Change color to primary (optional)
    transition: { type: "spring", stiffness: 400, damping: 15 },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Mohsen Amini
        </Link>
        <div className="flex items-center space-x-6">
          {" "}
          {/* Increased space */}
          {/* My Articles Link */}
          <motion.div whileHover={hoverEffect}>
            <Link
              href="/articles" // Link to your articles page
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              My Articles
            </Link>
          </motion.div>
          {/* Fan Hub Link */}
          <motion.div whileHover={hoverEffect}>
            <Link
              href="/fan-hub" // Link to the Fan Hub page
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Fan Hub
            </Link>
          </motion.div>
          {/* Conditional Profile/Logout Buttons */}
          {user && (
            <>
              <motion.div whileHover={hoverEffect} className="text-sm">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Profile
                  </Button>
                </Link>
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={async () => {
                  await signOut(auth);
                  router.push("/"); // Redirect to home after logout
                }}
              >
                Log Out
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
