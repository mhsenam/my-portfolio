"use client";

import { motion } from "framer-motion";

export function AnimatedDottedBackground() {
  return (
    <div className="opacity-10 fixed inset-0 -z-10 h-full w-full bg-background">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern
            id="dotted-pattern"
            width="28" // Adjust dot spacing (width/height)
            height="28"
            patternUnits="userSpaceOnUse"
            // We will animate x and y with framer-motion
          >
            {/* The dot */}
            <circle
              cx="1.5"
              cy="1.5"
              r="1.5"
              fill="hsl(var(--primary) / 0.1)"
            />
          </pattern>
        </defs>
        {/* Apply the pattern and animate its position */}
        <motion.rect
          width="100%"
          height="100%"
          strokeWidth="0"
          fill="url(#dotted-pattern)"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, 28, 0], // Move one pattern width and back
            y: [0, 28, 0], // Move one pattern height and back
          }}
          transition={{
            duration: 20, // Adjust speed of animation
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      </svg>
    </div>
  );
}
