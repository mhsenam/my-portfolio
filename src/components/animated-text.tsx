"use client";

import React from "react";
import {
  motion,
  useInView,
  useAnimation,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedTextProps {
  text: string;
  el?: React.ElementType; // Change type to React.ElementType
  className?: string;
  once?: boolean; // Only animate once
  amount?: number; // Trigger threshold (0 to 1)
  staggerChildren?: number; // Stagger delay for children
  wordAnimation?: boolean; // Animate words instead of characters
  colorful?: boolean; // Apply colorful effect
}

// Initial entrance animation for individual elements
const elementAnimations = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const hoverEffect = {
  scale: 1.05, // Slightly reduce hover scale to avoid conflict with scroll scale
  transition: { type: "spring", stiffness: 300, damping: 10 },
};

const colors = [
  "text-primary",
  "text-red-500",
  "text-blue-500",
  "text-green-500",
  "text-yellow-500",
  "text-purple-500",
  "text-pink-500",
];

export const AnimatedText = ({
  text,
  el: Wrapper = "p", // Default to <p> tag
  className,
  once = true, // Animate only once by default
  amount = 0.5, // Trigger when 50% visible
  staggerChildren = 0.1, // Default stagger
  wordAnimation = false, // Default to character animation
  colorful = false, // Default to no color cycling
}: AnimatedTextProps) => {
  const ref = useRef<HTMLSpanElement>(null); // Type the ref for useScroll
  const isInView = useInView(ref, { amount, once });
  const controls = useAnimation();

  // Scroll-linked animations setup
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // Animate as it enters and leaves viewport
  });

  // Map scroll progress to scale (e.g., 1 -> 1.25 -> 1)
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1], // Input range (start, middle, end of viewport)
    [1, 1.25, 1] // Output scale values
  );

  // Map scroll progress to rotation (e.g., -2deg -> 0deg -> 2deg)
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [-2, 2] // Rotate slightly as it scrolls
  );

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      // If not animating once, reset when out of view
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  const textElements = wordAnimation ? text.split(" ") : text.split("");

  return (
    <Wrapper className={className} ref={ref}>
      {/* This outer span handles the scroll-linked scale and rotation */}
      <motion.span
        style={{
          scale, // Apply the transformed scale
          rotate, // Apply the transformed rotation
          display: "inline-block", // Needed for transforms to apply correctly
        }}
      >
        {/* This inner span handles the staggered entrance animation */}
        <motion.span
          initial="hidden"
          animate={controls}
          variants={{
            visible: { transition: { staggerChildren } },
            hidden: {},
          }}
          aria-hidden // Hide from screen readers as we read the whole text
          style={{ display: "inline-block" }} // Ensure inner span behaves correctly
        >
          {textElements.map((element, index) => (
            <motion.span
              key={index}
              variants={elementAnimations} // Use renamed variants
              whileHover={hoverEffect}
              style={{ display: wordAnimation ? "inline-block" : "inline" }} // Needed for word spacing
              className={`${wordAnimation ? "mr-[0.25em]" : ""} ${
                // Add margin for words
                colorful ? colors[index % colors.length] : ""
              }`}
            >
              {element}
            </motion.span>
          ))}
        </motion.span>
      </motion.span>
    </Wrapper>
  );
};
