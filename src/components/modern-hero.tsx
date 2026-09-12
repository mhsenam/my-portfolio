"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Github, Linkedin, Twitter, ArrowDown, Sparkles } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

interface ModernHeroProps {
  avatarUrl?: string;
}

// Deterministic particle positions (fixed values to avoid hydration mismatch)
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: (i * 5.26 + 3) % 100,
  top: (i * 7.13 + 5) % 100,
  size: 2 + (i % 3),
  duration: 5 + (i % 5) * 2,
  delay: (i * 0.25) % 5,
}));

const TECH_STACK = [
  "Next.js", "React", "TypeScript", "AI / ML", "TailwindCSS",
  "Node.js", "Firebase", "GSAP", "UI / UX", "Python",
];

export function ModernHero({ avatarUrl }: ModernHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Avatar pops in
      tl.fromTo(
        avatarRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
      );

      // Status badge
      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.8"
      );

      // Title with character split
      if (titleRef.current) {
        const titleText = "Mohsen Amini";
        titleRef.current.innerHTML = "";

        const chars = titleText.split("").map((char) => {
          const span = document.createElement("span");
          span.textContent = char === " " ? "\u00A0" : char;
          // Apply gradient per-char: transformed children break parent bg-clip:text
          span.className = "inline-block text-gradient animate-gradient-x";
          span.style.opacity = "0";
          span.style.transform = "translateY(100%) rotate(6deg)";
          titleRef.current?.appendChild(span);
          return span;
        });

        tl.to(chars, {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.7,
          stagger: 0.035,
          ease: "power3.out",
        }, "-=0.5");
      }

      tl.fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.4");
      tl.fromTo(descRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.5");

      tl.fromTo(
        socialRef.current?.children || [],
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: "back.out(2)" },
        "-=0.4"
      );

      tl.fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.2");
      tl.fromTo(marqueeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.3");
      tl.fromTo(scrollIndicatorRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.5");

      // Continuous scroll indicator bounce
      gsap.to(scrollIndicatorRef.current, {
        y: -10,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Parallax effect on scroll
      gsap.to(avatarRef.current, {
        y: -100,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to([titleRef.current, subtitleRef.current], {
        y: -50,
        opacity: 0.5,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom center",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted]);

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/mhsenam/", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/mhsenam", label: "GitHub" },
    { icon: Twitter, href: "https://x.com/Mhsenam", label: "Twitter" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Aurora background ── */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-32 left-[10%] w-[36rem] h-[36rem] rounded-full blur-[120px] opacity-25 animate-aurora"
          style={{ background: "var(--glow-1)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full blur-[120px] opacity-20 animate-aurora"
          style={{ background: "var(--glow-2)", animationDelay: "-5s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-15 animate-aurora"
          style={{ background: "var(--glow-3)", animationDelay: "-9s" }}
        />
      </div>

      {/* Grid overlay with radial fade */}
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />

      {/* Floating particles */}
      {isMounted && (
        <div className="particles absolute inset-0 pointer-events-none" aria-hidden="true">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle absolute rounded-full bg-primary/25"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                animation: `float ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Hero content ── */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-32 text-center">
        {/* Avatar with animated glow */}
        <div ref={avatarRef} className="relative inline-block mb-8">
          <div
            className="absolute -inset-3 rounded-full blur-2xl opacity-50 animate-pulse"
            style={{ background: "conic-gradient(from 0deg, var(--glow-1), var(--glow-2), var(--glow-3), var(--glow-1))" }}
          />
          <Avatar className="w-36 h-36 sm:w-44 sm:h-44 border-2 border-primary/40 shadow-2xl relative z-10">
            <AvatarImage src={avatarUrl} alt="Mohsen Amini" className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-500 text-white">
              MA
            </AvatarFallback>
          </Avatar>
          {/* Orbiting rings */}
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite]" style={{ transform: "scale(1.2)" }} />
          <div className="absolute inset-0 rounded-full border border-dashed border-[color-mix(in_oklch,var(--glow-2)_40%,transparent)] animate-[spin_16s_linear_infinite_reverse]" style={{ transform: "scale(1.38)" }} />
        </div>

        {/* Availability badge */}
        <div ref={badgeRef} className="flex justify-center mb-6 opacity-0">
          <span className="glass inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            Available for new projects
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </span>
        </div>

        {/* Animated title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-6 font-heading text-gradient animate-gradient-x pb-2"
        >
          {isMounted ? "" : "Mohsen Amini"}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-6 max-w-3xl mx-auto font-heading"
        >
          <span className="text-foreground font-semibold">AI Specialist</span>
          <span className="mx-3 text-primary">✦</span>
          <span className="text-foreground font-semibold">Web Developer</span>
        </p>

        <p ref={descRef} className="text-base sm:text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Building the future with intelligent web experiences. I craft cutting-edge
          solutions that blend artificial intelligence with modern design.
        </p>

        {/* Social links */}
        <div ref={socialRef} className="flex justify-center gap-4 mb-10">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label={link.label}
              >
                <div
                  className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
                />
                <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl glass group-hover:border-primary/50 group-hover:-translate-y-1 transition-all duration-300">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#projects"
            className="group relative px-8 py-4 rounded-2xl font-semibold text-primary-foreground overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
          >
            <span className="relative z-10 flex items-center gap-2 text-white">
              View My Work
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
            </span>
            {/* Shine sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </Link>

          <Link
            href="mailto:mohsenamini1081@gmail.com"
            className="group px-8 py-4 rounded-2xl font-semibold glass hover:border-primary/50 transition-all duration-300 hover:scale-[1.03] flex items-center gap-2"
          >
            <Mail className="w-5 h-5 text-primary" />
            Get In Touch
          </Link>
        </div>
      </div>

      {/* ── Tech marquee strip ── */}
      <div
        ref={marqueeRef}
        className="absolute bottom-20 left-0 right-0 overflow-hidden opacity-0 select-none"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        }}
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee gap-10 py-3">
          {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
            <span
              key={i}
              className="flex items-center gap-10 text-sm font-medium tracking-widest uppercase text-muted-foreground/50"
            >
              {tech}
              <span className="text-primary/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground opacity-0"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ArrowDown className="w-4 h-4" />
      </div>
    </div>
  );
}
