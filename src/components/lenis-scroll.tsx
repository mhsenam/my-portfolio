"use client";

import { useEffect, useRef } from "react";

// Simple smooth scroll implementation using requestAnimationFrame
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    let currentScroll = 0;
    let targetScroll = 0;
    const ease = 0.075;

    // Update target scroll on wheel
    const handleWheel = (e: WheelEvent) => {
      targetScroll += e.deltaY;
      // Clamp scroll
      const maxScroll = (contentRef.current?.offsetHeight || 0) - window.innerHeight;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      e.preventDefault();
    };

    // Smooth scroll loop
    let rafId: number;
    const smoothScroll = () => {
      currentScroll += (targetScroll - currentScroll) * ease;

      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(-${currentScroll}px)`;
      }

      rafId = requestAnimationFrame(smoothScroll);
    };

    smoothScroll();

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
    >
      <div
        ref={contentRef}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
}
