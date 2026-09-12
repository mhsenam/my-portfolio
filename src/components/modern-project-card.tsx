"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ExternalLink, Github, FileCode2 } from "lucide-react";

export interface ProjectInfo {
  title: string;
  image: string;
  description: string[];
  link: string;
  github?: string;
  skills: string[];
}

interface ModernProjectCardProps {
  project: ProjectInfo;
  index: number;
}

// Turn "Pet Mate" into "pet-mate.tsx"
function toFileName(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".tsx";
}

export function ModernProjectCard({ project, index }: ModernProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const inner = innerRef.current;
    if (!card || !inner) return;

    // Entrance animation with stagger
    gsap.fromTo(card,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: index * 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Subtle 3D tilt
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 24;
      const rotateY = (centerX - x) / 24;

      gsap.to(inner, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(imageRef.current, {
        x: (centerX - x) / 30,
        y: (centerY - y) / 30,
        duration: 0.35,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(imageRef.current, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [index]);

  return (
    <div ref={cardRef} className="group relative h-full" style={{ perspective: 1000 }}>
      <div
        ref={innerRef}
        className="term relative h-full transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 group-hover:border-primary/40"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Editor tab bar */}
        <div className="term-bar justify-between">
          <span className="flex items-center gap-2 px-2.5 py-1 -my-1 rounded-t-md bg-background/60 border border-b-0 border-border text-foreground/90">
            <FileCode2 className="w-3.5 h-3.5 text-primary" />
            {toFileName(project.title)}
            <span className="text-muted-foreground/50 ml-1">●</span>
          </span>
          <span className="hidden sm:inline text-muted-foreground/50">UTF-8</span>
        </div>

        {/* Image "preview pane" with parallax */}
        <div ref={imageRef} className="relative h-44 overflow-hidden border-b border-border">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay with links */}
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px]">
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.title}`}
              className="keycap px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 bg-primary text-primary-foreground border-primary/60"
            >
              <ExternalLink className="w-4 h-4" />
              npm run demo
            </Link>
            {project.github && (
              <Link
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="keycap w-10 h-10 flex items-center justify-center text-foreground"
              >
                <Github className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Content — code style */}
        <div className="p-5 font-mono">
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            <span className="tok-kw">export</span>{" "}
            <span className="text-foreground">{project.title.replace(/\s+/g, "")}</span>
          </h3>

          <p className="text-muted-foreground text-[13px] mb-4 line-clamp-2 leading-relaxed font-sans">
            {project.description[0]}
          </p>

          {/* Skills as imports */}
          <div className="flex flex-wrap gap-1.5">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] rounded border border-border bg-secondary/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
