"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

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
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Entrance animation with stagger
    gsap.fromTo(card,
      { y: 100, opacity: 0, rotateX: 15 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // 3D tilt effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: "power2.out",
      });

      // Image parallax inside card
      gsap.to(imageRef.current, {
        x: (centerX - x) / 20,
        y: (centerY - y) / 20,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(imageRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative h-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative h-full rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-colors duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
        {/* Image container with parallax */}
        <div
          ref={imageRef}
          className="relative h-48 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 z-10" />
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay with links */}
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm">
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform duration-300"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
            {project.github && (
              <Link
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-card text-foreground hover:scale-110 transition-transform duration-300"
              >
                <Github className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-6">
          <h3
            ref={titleRef}
            className="text-xl font-bold mb-3 font-heading group-hover:text-primary transition-colors duration-300"
          >
            {project.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description[0]}
          </p>

          {/* Skills tags */}
          <div ref={skillsRef} className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md" />
      </div>
    </div>
  );
}
