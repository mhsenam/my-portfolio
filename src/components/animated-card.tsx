'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number; // Optional stagger amount for multiple cards
  index?: number;   // Index for staggering calculation
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  stagger = 0.1,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Initial state (hidden)
    gsap.set(element, { opacity: 0, y: 50, rotation: -5, scale: 0.9 });

    // Animation with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 85%', // Trigger when 85% from the top of the viewport
        end: 'bottom 20%',
        toggleActions: 'play none none none', // Play animation once on enter
        // markers: true, // Uncomment for debugging trigger points
      },
    });

    tl.to(element, {
      opacity: 1,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      delay: index * stagger, // Apply stagger delay based on index
    });

    // Cleanup function to kill animations and ScrollTriggers on unmount
    return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === element) {
                trigger.kill();
            }
        });
    };

  }, [index, stagger]); // Rerun effect if index or stagger changes

  return (
    <div ref={cardRef} className={className}>
      {children}
    </div>
  );
}; 