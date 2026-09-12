import { ModernHero } from "@/components/modern-hero";
import { ModernProjectCard, ProjectInfo } from "@/components/modern-project-card";
import { CustomCursor } from "@/components/custom-cursor";
import { ContactPopover } from "@/components/contact-popover";
import { GitHubRepos } from "@/components/github-repos";
import { Mail, ArrowUpRight, Sparkles, Code2, Palette } from "lucide-react";
import Link from "next/link";
import { getProfilePhoto } from "@/lib/linkedin";

// Make component async
export default async function Home() {
  // Fetch profile photo
  const avatarUrl = await getProfilePhoto();

  // Project data
  const projects: ProjectInfo[] = [
    {
      title: "Pet Mate",
      image: "/project_icons/petmate.png",
      description: ["Pet Mate is a platform for pet owners to find and connect with other pet lovers in their area."],
      link: "http://petmate.ir/",
      github: "https://github.com/mhsenam",
      skills: ["React", "Next.js", "TypeScript", "Firebase", "TailwindCSS"],
    },
    {
      title: "Meetify",
      image: "/project_icons/meetify.png",
      description: ["Meetify is a platform for creating and joining events with friends and communities."],
      link: "https://meetify.mhsenam.ir/",
      github: "https://github.com/mhsenam",
      skills: ["React", "Next.js", "TypeScript", "Firebase", "TailwindCSS"],
    },
    {
      title: "YouTube Downloader",
      image: "/project_icons/yl.png",
      description: ["A powerful tool for downloading YouTube videos in multiple formats and qualities."],
      link: "https://dl.mhsenam.ir",
      skills: ["HTML", "CSS", "JavaScript"],
    },
  ];

  const highlights = [
    {
      icon: Sparkles,
      title: "AI Integration",
      text: "Intelligent features powered by modern machine-learning tooling.",
    },
    {
      icon: Code2,
      title: "Modern Web",
      text: "Fast, accessible apps built on Next.js, React & TypeScript.",
    },
    {
      icon: Palette,
      title: "Design Craft",
      text: "Pixel-perfect interfaces with motion and delightful details.",
    },
  ];

  return (
    <>
      <CustomCursor />

      {/* Hero Section */}
      <ModernHero avatarUrl={avatarUrl} />

      {/* About Section */}
      <section className="relative py-32 px-4">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: "var(--glow-2)" }} />

        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="eyebrow">About Me</span>
              <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
                Crafting Digital
                <span className="text-gradient animate-gradient-x"> Experiences</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I&apos;m Mohsen Amini, a passionate developer specializing in the intersection
                of AI and modern web development. I create innovative solutions that push
                the boundaries of what&apos;s possible on the web.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From intelligent automation to stunning interfaces, I bring ideas to life
                with cutting-edge technology and meticulous attention to detail.
              </p>

              {/* Highlight chips */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {highlights.map((h) => {
                  const Icon = h.icon;
                  return (
                    <div key={h.title} className="glass rounded-2xl p-4 hover:border-primary/40 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-semibold mb-1">{h.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{h.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code window */}
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-20"
                style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
              />
              <div className="gradient-border relative rounded-3xl overflow-hidden shadow-2xl">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-secondary/40">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-muted-foreground font-mono">developer.ts</span>
                </div>
                <div className="font-mono text-sm space-y-2 p-6 leading-relaxed">
                  <p><span className="text-muted-foreground/50 select-none mr-4">1</span><span className="text-purple-400">const</span> <span className="text-blue-400">developer</span> = {"{"}</p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">2</span><span className="pl-4"><span className="text-emerald-400">name</span>: <span className="text-amber-300">&quot;Mohsen Amini&quot;</span>,</span></p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">3</span><span className="pl-4"><span className="text-emerald-400">skills</span>: [<span className="text-amber-300">&quot;AI&quot;</span>, <span className="text-amber-300">&quot;Web Dev&quot;</span>, <span className="text-amber-300">&quot;UI/UX&quot;</span>],</span></p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">4</span><span className="pl-4"><span className="text-emerald-400">passion</span>: <span className="text-purple-400">Infinity</span>,</span></p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">5</span><span className="pl-4"><span className="text-emerald-400">coffee</span>: <span className="text-orange-400">true</span>,</span></p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">6</span>{"}"};</p>
                  <p><span className="text-muted-foreground/50 select-none mr-4">7</span><span className="inline-block w-2 h-4 bg-primary/70 animate-pulse align-middle" /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative py-32 px-4">
        <div className="absolute top-1/4 left-0 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: "var(--glow-1)" }} />

        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="eyebrow mb-4">Featured Work</span>
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-4 mt-4">
              Selected <span className="text-gradient animate-gradient-x">Projects</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A collection of projects showcasing my skills in AI, web development, and creative problem-solving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <ModernProjectCard key={i} project={project} index={i} />
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="https://github.com/mhsenam?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass font-medium hover:border-primary/50 hover:text-primary transition-all duration-300 hover:scale-105"
            >
              View All Projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GitHub Repos Section */}
      <section className="relative py-32 px-4">
        <div className="absolute bottom-0 right-1/4 w-[26rem] h-[26rem] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: "var(--glow-3)" }} />

        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="eyebrow mb-4">Open Source</span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight mt-4">
              Latest <span className="text-gradient animate-gradient-x">Contributions</span>
            </h2>
          </div>
          <GitHubRepos username="mhsenam" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full blur-[160px] opacity-15"
            style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
          />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="gradient-border glass rounded-[2rem] p-10 md:p-16 text-center space-y-8">
            <span className="eyebrow">Get In Touch</span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
              Let&apos;s Build Something <span className="text-gradient animate-gradient-x">Amazing</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I&apos;m always open to discussing new ideas and opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Link
                href="mailto:mohsenamini1081@gmail.com"
                className="group relative px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-2 overflow-hidden hover:scale-[1.03] transition-transform duration-300 shadow-lg shadow-primary/30"
                style={{ background: "linear-gradient(135deg, var(--glow-1), var(--glow-2))" }}
              >
                <Mail className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Send Email</span>
                <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform duration-300" />
                <span className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </Link>

              <ContactPopover />
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4 pt-6">
              {[
                { name: "GitHub", url: "https://github.com/mhsenam", icon: "gh" },
                { name: "LinkedIn", url: "https://www.linkedin.com/in/mhsenam/", icon: "li" },
                { name: "Twitter", url: "https://x.com/Mhsenam", icon: "tw" },
              ].map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl glass hover:border-primary/50 hover:text-primary hover:-translate-y-1 transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon === "gh" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                  )}
                  {social.icon === "li" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  )}
                  {social.icon === "tw" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Mohsen Amini. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <span className="text-gradient font-semibold">Next.js</span> + <span className="text-gradient font-semibold">GSAP</span> & lots of coffee ☕
          </p>
        </div>
      </footer>
    </>
  );
}
