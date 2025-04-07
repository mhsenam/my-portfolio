"use client"; // Add this directive

import Link from "next/link";
import { ModeToggle } from "./theme-toggle"; // Import the toggle
import { motion } from "framer-motion"; // Import motion

export function Navbar() {
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
          {/* Add other nav links here if needed */}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
