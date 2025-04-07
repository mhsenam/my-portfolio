"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react"; // A fun icon
import { gsap } from "gsap";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    // Animate elements in
    tl.from(textRef.current, {
      opacity: 0,
      y: -50,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(
        ghostRef.current,
        {
          opacity: 0,
          scale: 0.5,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      ) // Overlap slightly with text animation
      .from(
        buttonRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Add continuous floating animation to the ghost
    gsap.to(ghostRef.current, {
      y: "-=15",
      duration: 1.5,
      repeat: -1, // Infinite repeats
      yoyo: true, // Go back and forth
      ease: "sine.inOut",
      delay: 1, // Start floating after entrance
    });

    // Cleanup
    return () => {
      tl.kill();
      gsap.killTweensOf(ghostRef.current); // Kill the floating animation
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 bg-gradient-to-br from-background via-secondary/10 to-background"
      style={{ paddingTop: "4rem" }} // Offset for fixed navbar height
    >
      {/* Animated Ghost Icon */}
      <Ghost
        ref={ghostRef}
        className="w-24 h-24 sm:w-32 sm:h-32 text-primary/70 mb-6"
        strokeWidth={1.5}
      />

      {/* Animated Fun Text */}
      <h1
        ref={textRef}
        className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-primary mb-4"
      >
        Oops! Lost in Cyberspace?
      </h1>

      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
        It seems the page you were looking for decided to play hide-and-seek.
        Let&apos;s get you back on track.
      </p>

      {/* Animated Button */}
      <Link href="/" passHref ref={buttonRef}>
        <Button size="lg" className="cursor-pointer">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
