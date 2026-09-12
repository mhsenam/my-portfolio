"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";

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

export function ModernProjectCard({ project, index }: ModernProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

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

    // 3D tilt + spotlight tracking on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 18;
      const rotateY = (centerX - x) / 18;

      gsap.to(inner, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.35,
        ease: "power2.out",
      });

      // Spotlight follows cursor
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, color-mix(in oklch, var(--glow-1) 12%, transparent), transparent 65%)`;
      }

      // Image parallax inside card
      gsap.to(imageRef.current, {
        x: (centerX - x) / 25,
        y: (centerY - y) / 25,
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
      if (spotlightRef.current) {
        spotlightRef.current.style.background = "transparent";
      }
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
        className="gradient-border relative h-full rounded-3xl overflow-hidden transition-shadow duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/15"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Cursor spotlight */}
        <div ref={spotlightRef} className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300" />

        {/* Image container with parallax */}
        <div ref={imageRef} className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-card via-transparent to-transparent" />
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay with links */}
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.title}`}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-white hover:scale-110 transition-transform duration-300 shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
            {project.github && (
              <Link
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="w-12 h-12 flex items-center justify-center rounded-2xl glass text-foreground hover:scale-110 transition-transform duration-300"
              >
                <Github className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors duration-300">
              {project.title}
            </h3>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </div>

          <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
            {project.description[0]}
          </p>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/15 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
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
