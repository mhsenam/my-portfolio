"use client";

import { useEffect, useRef } from "react";
import {
  fadeIn,
  staggerFadeIn,
  scaleIn,
  scrollReveal,
  parallax,
  magneticEffect,
  refreshScrollTrigger,
  killAllAnimations,
  createTimeline,
  gsap,
  ScrollTrigger,
} from "@/lib/gsap-utils";

/**
 * Hook for GSAP animations with automatic cleanup
 */
export function useGsap() {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create a GSAP context for easy cleanup
    ctxRef.current = gsap.context(() => {});

    return () => {
      // Cleanup on unmount
      if (ctxRef.current) {
        ctxRef.current.revert();
      }
    };
  }, []);

  return {
    fadeIn,
    staggerFadeIn,
    scaleIn,
    scrollReveal,
    parallax,
    magneticEffect,
    refreshScrollTrigger,
    killAllAnimations,
    createTimeline,
    gsap,
    ScrollTrigger,
  };
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _elements: gsap.TweenTarget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _animation: "fade" | "scale" | "slide",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: {
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    stagger?: number;
    start?: string;
  }
) {
  // Placeholder for future scroll animation implementation
  // Currently unused but kept for API consistency
}

/**
 * Hook for parallax effect on scroll
 */
export function useParallax(
  speed: number = 0.5,
  enabled: boolean = true
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { parallax } = useGsap();

  useEffect(() => {
    if (enabled && elementRef.current) {
      const killFn = parallax(elementRef.current, speed);
      return () => {
        if (killFn) killFn.kill();
      };
    }
  }, [speed, enabled, parallax]);

  return elementRef;
}

/**
 * Hook for magnetic button effect
 */
export function useMagnetic(strength: number = 0.3) {
  const elementRef = useRef<HTMLButtonElement>(null);
  const { magneticEffect } = useGsap();

  useEffect(() => {
    if (elementRef.current) {
      const cleanup = magneticEffect(elementRef.current, strength);
      return cleanup;
    }
  }, [strength, magneticEffect]);

  return elementRef;
}

/**
 * Hook for text reveal animation
 */
export function useTextReveal(text: string, delay: number = 0) {
  const textRef = useRef<HTMLSpanElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    if (textRef.current && text) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay, ease: "power3.out" }
      );
    }
  }, [text, delay, gsap]);

  return textRef;
}

/**
 * Hook for cursor follower animation
 */
export function useCursorFollower(enabled: boolean = true) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    if (!enabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Show cursor on mouse move
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3 });
    };

    window.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseenter", onMouseEnter, true);
    document.body.addEventListener("mouseleave", onMouseLeave, true);

    // Initially hide cursor
    gsap.set(cursor, { scale: 0, opacity: 0 });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseenter", onMouseEnter, true);
      document.body.removeEventListener("mouseleave", onMouseLeave, true);
    };
  }, [enabled, gsap]);

  return cursorRef;
}

/**
 * Hook for page transition animation
 */
export function usePageTransition() {
  const { gsap } = useGsap();
  const containerRef = useRef<HTMLDivElement>(null);

  const animateIn = () => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    ).fromTo(
      containerRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" },
      "-=0.3"
    );

    return tl;
  };

  const animateOut = () => {
    if (!containerRef.current) return;

    return gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });
  };

  return { containerRef, animateIn, animateOut };
}
