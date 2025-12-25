"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const cursorOuter = cursorOuterRef.current;

    if (!cursor || !follower) return;

    // Cursor position
    const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const followerPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Update cursor position
    const updateCursor = (e: MouseEvent) => {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;

      gsap.set(cursor, { x: e.clientX, y: e.clientY });
    };

    // Smooth follower animation
    gsap.ticker.add(() => {
      const dt = 1 - Math.pow(1 - 0.15, gsap.ticker.deltaRatio());

      followerPos.x += (cursorPos.x - followerPos.x) * dt;
      followerPos.y += (cursorPos.y - followerPos.y) * dt;

      gsap.set(follower, { x: followerPos.x, y: followerPos.y });
    });

    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll("a, button, [role='button']");

    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 0, duration: 0.2 });
      gsap.to(follower, { scale: 2, duration: 0.3, ease: "power2.out" });
      gsap.to(cursorOuter, { scale: 1.5, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
      gsap.to(follower, { scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(cursorOuter, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    // Add listeners to all interactive elements
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Click effect
    const handleClick = () => {
      gsap.fromTo(
        cursorOuter,
        { scale: 0.8 },
        { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1 }
      );
    };

    // Hide cursor when leaving window
    const handleMouseLeaveWindow = () => {
      gsap.to([cursor, follower, cursorOuter], { opacity: 0, duration: 0.2 });
    };

    const handleMouseEnterWindow = () => {
      gsap.to([cursor, follower, cursorOuter], { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("click", handleClick);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    // Initial hide
    gsap.set([cursor, follower, cursorOuter], { opacity: 0 });

    // Show after a short delay
    setTimeout(() => {
      gsap.to([cursor, follower, cursorOuter], { opacity: 1, duration: 0.3 });
    }, 500);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      {/* Cursor follower circle */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9998] transition-colors duration-300 mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      {/* Outer glow ring */}
      <div
        ref={cursorOuterRef}
        className="fixed top-0 left-0 w-16 h-16 bg-primary/10 rounded-full pointer-events-none z-[9997]"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  );
}
