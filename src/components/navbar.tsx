"use client"; // Add this directive

import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { ModeToggle } from "./theme-toggle"; // Import the toggle
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "../lib/firebaseConfig"; // Trying path relative to src
import { Button } from "@/components/ui/button"; // Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Menu } from "lucide-react"; // Keep Menu icon

export function Navbar() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Simplified hover effect (optional)
  const linkClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";
  const mobileLinkClasses =
    "text-base font-medium cursor-pointer w-full text-left"; // Ensure items take full width and text is aligned left

  const navLinks = (
    <>
      <Link href="/articles" className={linkClasses}>
        My Articles
      </Link>
      <Link href="/fan-hub" className={linkClasses}>
        Fan Hub
      </Link>
      {user && (
        <>
          <Link href="/profile" className={linkClasses}>
            Profile
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={`${linkClasses} px-0`} // Align style
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Mohsen Amini
        </Link>

        {/* Desktop Navigation (Hidden on smaller screens) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks} {/* Use the extracted links */}
          <ModeToggle />
        </div>

        {/* Mobile Navigation (Visible on smaller screens) using DropdownMenu */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-center font-semibold">
                Navigation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className={mobileLinkClasses}>
                <Link href="/articles">My Articles</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={mobileLinkClasses}>
                <Link href="/fan-hub">Fan Hub</Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className={mobileLinkClasses}>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={mobileLinkClasses}
                  >
                    Log Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
