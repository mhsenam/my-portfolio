"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Github, Linkedin, Twitter, ArrowDown } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

interface ModernHeroProps {
  avatarUrl?: string;
}

// Deterministic particle positions (fixed values to avoid hydration mismatch)
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: (i * 5.26) % 100, // Fixed positions based on index
  top: (i * 7.13) % 100,
  duration: 5 + (i % 5) * 2, // Duration between 5-15s
  delay: (i * 0.25) % 5, // Delay between 0-5s
}));

export function ModernHero({ avatarUrl }: ModernHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Initial timeline for hero entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate avatar from nothing
      tl.fromTo(
        avatarRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
      );

      // Animate title with character split
      if (titleRef.current) {
        const titleText = "Mohsen Amini";
        titleRef.current.innerHTML = "";

        const chars = titleText.split("").map((char) => {
          const span = document.createElement("span");
          span.textContent = char === " " ? "\u00A0" : char;
          span.className = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(100%)";
          titleRef.current?.appendChild(span);
          return span;
        });

        tl.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.03,
          ease: "power2.out",
        }, "-=0.6");
      }

      // Animate subtitle
      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      );

      // Animate social icons
      tl.fromTo(
        socialRef.current?.children || [],
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1 },
        "-=0.4"
      );

      // Animate CTA
      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      );

      // Animate scroll indicator
      tl.fromTo(
        scrollIndicatorRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3"
      );

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

      // Text reveal parallax
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
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Floating particles - with deterministic positions */}
      {isMounted && (
        <div className="particles absolute inset-0 pointer-events-none">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animation: `float ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Avatar with animated glow */}
        <div ref={avatarRef} className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <Avatar className="w-40 h-40 sm:w-52 sm:h-52 border-4 border-primary/50 shadow-2xl relative z-10">
            <AvatarImage src={avatarUrl} alt="Mohsen Amini" className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-500 text-white">
              MA
            </AvatarFallback>
          </Avatar>
          {/* Orbiting ring */}
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite]" style={{ transform: "scale(1.2)" }} />
          <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]" style={{ transform: "scale(1.4)" }} />
        </div>

        {/* Animated title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 font-heading"
        >
          {isMounted ? "" : "Mohsen Amini"}
        </h1>

        {/* Subtitle with gradient text */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto"
        >
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
            AI Specialist
          </span>
          {" "}&{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
            Web Developer
          </span>
        </p>

        <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
          Building the future with intelligent web experiences. I craft cutting-edge
          solutions that blend artificial intelligence with modern design.
        </p>

        {/* Social links with magnetic effect */}
        <div ref={socialRef} className="flex justify-center gap-4 mb-12">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-card border border-border hover:border-primary/50 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#projects"
            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105"
          >
            <span className="relative z-10">View My Work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="mailto:mohsenamini1081@gmail.com"
            className="group px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary/10 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Get In Touch
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground opacity-0"
      >
        <span className="text-sm">Scroll to explore</span>
        <ArrowDown className="w-5 h-5" />
      </div>
    </div>
  );
}
