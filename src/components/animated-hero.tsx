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

    // Cleanup
    return () => {
      tl.kill();
    };
  }, []); // Run only once on mount

  return (
    <div ref={heroRef} className={className}>
      {children}
    </div>
  );
};
