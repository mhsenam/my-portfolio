"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ExternalLink } from "lucide-react";

export interface ProjectInfo {
  title: string;
  image: string;
  description: string[];
  link: string;
  skills: string[];
}

export function ProjectCard({
  project,
  i,
}: {
  project: ProjectInfo;
  i: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onEnter = () => {
      gsap.to(el, {
        scale: 1.04,
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
        duration: 0.3,
        ease: "power2.inOut",
      });
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <Card
      ref={cardRef}
      className="group relative flex flex-col justify-between items-stretch hover:shadow-md transition-shadow h-[370px] max-h-[500px] min-h-[400px] p-0"
    >
      <div className="flex flex-col items-center px-6 pt-6 flex-1">
        <Image
          src={project.image}
          alt={`${project.title} project screenshot by Mohsen Amini`}
          width={120}
          height={120}
          className="w-32 h-32 object-contain bg-muted rounded-lg mb-2"
          priority={i === 0}
          unoptimized={project.image.endsWith(".svg")}
        />
        <div className="font-semibold text-base text-center mb-1 dark:text-white text-black w-full truncate">
          {project.title}
        </div>
        <div className="w-full overflow-y-auto max-h-[2.8em] min-h-[2.8em] text-center mb-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
          {project.description.map((line, idx) => (
            <p
              key={idx}
              className="text-sm text-muted-foreground leading-tight whitespace-pre-line"
            >
              {line}
            </p>
          ))}
        </div>
        <div className="rounded-md p-2 mt-2 mb-2 w-full">
          <span className="block text-xs font-semibold mb-1 dark:text-white text-black">
            Skills
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {project.skills.map((skill, sidx) => (
              <span
                key={sidx}
                className="px-2 py-0.5 rounded text-xs font-medium bg-white/90 text-black dark:bg-black/90 dark:text-white border border-neutral-300 dark:border-neutral-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full flex justify-center items-end">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Project"
            className="w-full max-w-full overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold text-sm transition-colors bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow dark:shadow-none"
          >
            <ExternalLink className="h-4 w-4" />
            View Project
          </a>
        </div>
      </div>
    </Card>
  );
}
