"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface AnimatedHeroProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  children,
  className,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = heroRef.current;
    if (!element) return;

    // Select elements within the hero section to animate
    const avatar = element.querySelector(".hero-avatar");
    const headline = element.querySelector(".hero-headline");
    const paragraph = element.querySelector(".hero-paragraph");
    const social = element.querySelector(".hero-social");
    const popover = element.querySelector(".hero-popover");

    const elementsToAnimate = [
      avatar,
      headline,
      paragraph,
      social,
      popover,
    ].filter(Boolean); // Filter out nulls

    if (elementsToAnimate.length === 0) return;

    // Initial state
    gsap.set(elementsToAnimate, { opacity: 0, y: 30 });

    // Staggered animation timeline
    const tl = gsap.timeline({ delay: 0.3 }); // Small delay after page load
    tl.staggerTo(
      elementsToAnimate,
      0.8,
      { opacity: 1, y: 0, ease: "power3.out" },
      0.15
    );

    // --- GSAP Hover Animation for Avatar ---
    let hoverTween: gsap.core.Tween | null = null; // To store the hover tween

    const handleMouseEnter = () => {
      // Kill any existing hover tween to prevent overlap
      if (hoverTween) {
        hoverTween.kill();
      }
      // Wobble/Steam effect
      hoverTween = gsap.to(avatar, {
        scale: 1.05,
        rotation: 5, // Rotate slightly
        duration: 0.2,
        ease: "power1.inOut",
        yoyo: true, // Go back and forth
        repeat: 3, // Repeat the wobble a few times
        onComplete: () => {
          // Ensure it returns exactly to the start state after wobbling
          gsap.to(avatar, { scale: 1.03, rotation: 0, duration: 0.1 }); // Slightly larger final state on hover
        },
      });
    };

    const handleMouseLeave = () => {
      // Kill the wobble tween immediately
      if (hoverTween) {
        hoverTween.kill();
      }
      // Return smoothly to default state
      gsap.to(avatar, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    if (avatar) {
      avatar.addEventListener("mouseenter", handleMouseEnter);
      avatar.addEventListener("mouseleave", handleMouseLeave);
    }
    // --- End GSAP Hover ---

    // Cleanup
    return () => {
      tl.kill();
      // Remove event listeners
      if (avatar) {
        avatar.removeEventListener("mouseenter", handleMouseEnter);
        avatar.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []); // Run only once on mount

  return (
    <div ref={heroRef} className={className}>
      {children}
    </div>
  );
};
