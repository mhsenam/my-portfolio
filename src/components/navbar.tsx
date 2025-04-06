"use client"; // Add this directive

import Link from "next/link";
import { ModeToggle } from "./theme-toggle"; // Import the toggle

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Mohsen Amini
        </Link>
        <div className="flex items-center space-x-4">
          {/* Add other nav links here if needed */}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
