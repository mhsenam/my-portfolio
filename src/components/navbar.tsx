"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useLazyAuthState } from "@/hooks/use-lazy-auth";

/**
 * Firebase (auth + firestore), sonner and date-fns live behind dynamic imports
 * so anonymous visitors never download them: the bell chunk loads only for
 * signed-in users, and signing out imports firebase/auth on demand.
 */
const NotificationsBell = dynamic(
  () => import("./navbar-notifications").then((m) => m.NotificationsBell),
  { ssr: false }
);

export function Navbar() {
  const [user] = useLazyAuthState();
  const router = useRouter();

  const handleLogout = async () => {
    const [{ auth }, { signOut }] = await Promise.all([
      import("@/lib/firebaseConfig"),
      import("firebase/auth"),
    ]);
    await signOut(auth);
    router.push("/");
  };

  const linkClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";
  const mobileLinkClasses = "text-base font-medium cursor-pointer w-full text-left";

  const navLinks = (
    <>
      <Link
        href="http://coff.ee/mhsenam"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="default"
          size="sm"
          className="cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black font-semibold mr-2 flex items-center gap-1 relative overflow-hidden shadow transition-shadow duration-300 group hover:shadow-2xl hover:shadow-yellow-400/80"
          style={{ position: "relative" }}
        >
          <span role="img" aria-label="coffee">
            ☕
          </span>{" "}
          Buy me a coffee
          <span className="absolute left-[-75%] top-0 h-full w-1/2 bg-white/40 opacity-0 group-hover:opacity-100 group-hover:animate-shine pointer-events-none rounded-full" />
          <style jsx global>{`
            @keyframes shine {
              0% {
                left: -75%;
                opacity: 0;
              }
              20% {
                opacity: 0.5;
              }
              60% {
                left: 120%;
                opacity: 0.5;
              }
              100% {
                left: 120%;
                opacity: 0;
              }
            }
            .group:hover .group-hover\\:animate-shine {
              animation: shine 1s linear;
            }
          `}</style>
        </Button>
      </Link>
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
            className={`${linkClasses} px-0`}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/60 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="font-mono text-sm sm:text-base font-bold tracking-tight flex items-center gap-2.5 group"
        >
          <span className="w-8 h-8 rounded-md flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold border border-primary/50 group-hover:scale-110 transition-transform duration-300">
            {">_"}
          </span>
          <span className="text-foreground">
            <span className="text-primary">~/</span>mhsenam
            <span className="text-primary animate-blink">_</span>
          </span>
        </Link>

        {/* Desktop Navigation (Hidden on smaller screens) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks}
          {user && <NotificationsBell user={user} />}
          <ModeToggle />
        </div>

        {/* Mobile Navigation (Visible on smaller screens) using DropdownMenu */}
        <div className="md:hidden flex items-center space-x-2">
          {user && <NotificationsBell user={user} />}
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
                <Link
                  href="https://www.buymeacoffee.com/mhsenam"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-1">
                    ☕ Buy me a coffee
                  </span>
                </Link>
              </DropdownMenuItem>
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
