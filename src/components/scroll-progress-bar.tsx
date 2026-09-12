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
    <div className="fixed top-16 left-0 w-full z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full rounded-full"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--glow-1), var(--glow-2), var(--glow-3))",
          boxShadow:
            progress > 0
              ? "0 0 12px 1px color-mix(in oklch, var(--glow-1) 60%, transparent)"
              : undefined,
          transition: "width 0.15s ease-out",
        }}
      />
    </div>
  );
}
