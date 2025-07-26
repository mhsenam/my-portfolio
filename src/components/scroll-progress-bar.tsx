"use client";
import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(percent);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 w-full z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full rounded-full transition-all duration-300 dark:bg-white bg-black shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow:
            progress > 0
              ? "0 0 12px 2px rgba(0,0,0,0.15), 0 0 24px 4px rgba(255,255,255,0.12)"
              : undefined,
          filter:
            progress > 0
              ? "drop-shadow(0 0 8px #fff8) drop-shadow(0 0 4px #0006)"
              : undefined,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}
