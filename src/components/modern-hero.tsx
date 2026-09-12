"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Github, Linkedin, Twitter, ArrowDown, Terminal } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

interface ModernHeroProps {
  avatarUrl?: string;
}

// Floating code snippets in the background (deterministic to avoid hydration mismatch)
const FLOATING_SNIPPETS = [
  { text: "const dev = new Human();", left: 6, top: 16, delay: 0, duration: 9 },
  { text: "while(alive) { code(); }", left: 74, top: 12, delay: 1.5, duration: 11 },
  { text: "git push --force # yolo", left: 10, top: 68, delay: 3, duration: 10 },
  { text: "sudo rm -rf doubts/", left: 78, top: 62, delay: 2, duration: 12 },
  { text: "0x1F600", left: 42, top: 8, delay: 4, duration: 9 },
  { text: "// TODO: sleep", left: 85, top: 38, delay: 0.8, duration: 10 },
  { text: "npm i success", left: 4, top: 42, delay: 2.6, duration: 11 },
  { text: "() => {}", left: 60, top: 78, delay: 1.2, duration: 9 },
];

const TECH_STACK = [
  "next.js", "react", "typescript", "ai/ml", "tailwind",
  "node.js", "firebase", "gsap", "python", "git",
];

// Lines "typed" into the hero terminal
type TermLine =
  | { type: "cmd"; text: string }
  | { type: "out"; html: string };

const TERM_LINES: TermLine[] = [
  { type: "cmd", text: "whoami" },
  { type: "out", html: "<span class='tok-ok font-semibold'>mohsen-amini</span> — AI specialist &amp; web developer" },
  { type: "cmd", text: "cat skills.json | jq '.top'" },
  {
    type: "out",
    html: "[<span class='tok-str'>\"AI\"</span>, <span class='tok-str'>\"Next.js\"</span>, <span class='tok-str'>\"TypeScript\"</span>, <span class='tok-str'>\"UI/UX\"</span>]",
  },
  { type: "cmd", text: "systemctl status mohsen.service" },
  {
    type: "out",
    html: "<span class='tok-ok'>●</span> active <span class='tok-ok'>(running)</span> — accepting new projects",
  },
];

export function ModernHero({ avatarUrl }: ModernHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Terminal typing state
  const [typedLines, setTypedLines] = useState<TermLine[]>([]);
  const [currentCmd, setCurrentCmd] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Typewriter effect for the terminal
  useEffect(() => {
    if (!isMounted) return;

    let lineIdx = 0;
    let charIdx = 0;
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(t);
    };

    const typeNext = () => {
      if (lineIdx >= TERM_LINES.length) return;
      const line = TERM_LINES[lineIdx];

      if (line.type === "cmd") {
        if (charIdx <= line.text.length) {
          setCurrentCmd(line.text.slice(0, charIdx));
          charIdx++;
          schedule(typeNext, 38 + Math.random() * 45);
        } else {
          // Commit the command line
          setTypedLines((prev) => [...prev, line]);
          setCurrentCmd("");
          lineIdx++;
          charIdx = 0;
          schedule(typeNext, 220);
        }
      } else {
        // Output appears instantly after a beat
        setTypedLines((prev) => [...prev, line]);
        lineIdx++;
        schedule(typeNext, 420);
      }
    };

    schedule(typeNext, 1200);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Left column cascades in
      tl.fromTo(
        leftColRef.current?.children || [],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }
      );

      // Terminal window slides in
      tl.fromTo(
        termRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        "-=0.5"
      );

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

      // Parallax on scroll
      gsap.to(termRef.current, {
        y: -60,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(leftColRef.current, {
        y: -40,
        opacity: 0.4,
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
    { icon: Github, href: "https://github.com/mhsenam", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/mhsenam/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/Mhsenam", label: "Twitter" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dotted grid backdrop */}
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />

      {/* Floating code snippets */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none select-none hidden md:block" aria-hidden="true">
          {FLOATING_SNIPPETS.map((s, i) => (
            <span
              key={i}
              className="absolute font-mono text-xs text-muted-foreground/25"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                animation: `float ${s.duration}s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            >
              {s.text}
            </span>
          ))}
        </div>
      )}

      {/* ── Hero content: two columns ── */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-32 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: intro */}
          <div ref={leftColRef} className="space-y-6 text-center lg:text-left">
            {/* Status badge */}
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md border border-border bg-card font-mono text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[var(--syntax-green)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--syntax-green)]" />
                </span>
                status: <span className="tok-ok">available_for_hire</span>
              </span>
            </div>

            {/* Avatar + name row */}
            <div className="flex items-center gap-5 justify-center lg:justify-start">
              <div className="relative shrink-0">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border shadow-xl rounded-2xl">
                  <AvatarImage src={avatarUrl} alt="Mohsen Amini" className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold font-mono bg-secondary rounded-2xl">
                    MA
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                </span>
              </div>
              <div className="text-left">
                <p className="font-mono text-sm text-muted-foreground mb-1">
                  <span className="tok-comment">{"// hello world, I'm"}</span>
                </p>
                <h1
                  ref={titleRef}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight"
                >
                  Mohsen<span className="text-primary">.</span>Amini
                  <span className="text-primary animate-blink">_</span>
                </h1>
              </div>
            </div>

            {/* Typed signature line */}
            <p className="font-mono text-base sm:text-lg text-muted-foreground">
              <span className="tok-kw">const</span>{" "}
              <span className="tok-fn">role</span> ={" "}
              <span className="tok-str">&quot;AI Specialist&quot;</span>{" "}
              <span className="tok-kw">|</span>{" "}
              <span className="tok-str">&quot;Web Developer&quot;</span>;
            </p>

            <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
              I build intelligent web experiences — shipping AI-powered products
              with clean code, strong typing, and an unhealthy number of terminal tabs.
            </p>

            {/* CTAs — keycap style */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <Link
                href="#projects"
                className="keycap group px-6 py-3 font-semibold text-sm inline-flex items-center gap-2 bg-primary text-primary-foreground border-primary/60 hover:border-primary"
              >
                <span className="tok-comment text-primary-foreground/70">$</span> view --projects
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="mailto:mohsenamini1081@gmail.com"
                className="keycap px-6 py-3 font-semibold text-sm inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-primary" />
                ping me
              </Link>
            </div>

            {/* Social links */}
            <div className="flex gap-3 justify-center lg:justify-start">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="keycap w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: live terminal */}
          <div ref={termRef} className="term font-mono text-sm opacity-0">
            {/* Title bar */}
            <div className="term-bar">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3">mohsen@portfolio: ~/intro — zsh</span>
            </div>
            {/* Terminal body */}
            <div className="p-5 space-y-2 min-h-[290px] leading-relaxed">
              {typedLines.map((line, i) =>
                line.type === "cmd" ? (
                  <p key={i}>
                    <span className="tok-ok">➜</span>{" "}
                    <span className="tok-fn">~</span>{" "}
                    <span className="text-foreground">{line.text}</span>
                  </p>
                ) : (
                  <p
                    key={i}
                    className="text-muted-foreground pl-5"
                    dangerouslySetInnerHTML={{ __html: line.html }}
                  />
                )
              )}
              {/* Active line with blinking cursor */}
              <p>
                <span className="tok-ok">➜</span>{" "}
                <span className="tok-fn">~</span>{" "}
                <span className="text-foreground">{currentCmd}</span>
                <span className="inline-block w-2.5 h-4 bg-primary/80 align-middle animate-blink ml-0.5" />
              </p>
            </div>
          </div>
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
        <div className="flex w-max animate-marquee gap-8 py-3 font-mono text-sm text-muted-foreground/50">
          {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>
                <span className="text-primary/50">import</span> {tech}
              </span>
              <span className="text-muted-foreground/30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground opacity-0 font-mono"
      >
        <span className="text-[10px] tracking-widest">scroll++</span>
        <ArrowDown className="w-4 h-4" />
      </div>
    </div>
  );
}
