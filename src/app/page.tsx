import { Suspense } from "react";
import type { Metadata } from "next";
import { ModernHero } from "@/components/modern-hero";
import { LazyContactPopover } from "@/components/lazy-contact-popover";
import { GitHubRepos } from "@/components/github-repos";
import { Mail, ArrowUpRight, Braces, Cpu, GitBranch, Coffee, Bug, Zap } from "lucide-react";
import Link from "next/link";
import { getProfilePhoto, GITHUB_USERNAME } from "@/lib/github-profile";

export const metadata: Metadata = {
  alternates: { canonical: "https://mhsenam.com/" },
};

// Make component async
export default async function Home() {
  // Fetch profile photo
  const avatarUrl = await getProfilePhoto();

  const stats = [
    { icon: Braces, label: "languages_spoken", value: "TS > JS > PY" },
    { icon: Cpu, label: "ai_models_bothered", value: "countless" },
    { icon: GitBranch, label: "branch_strategy", value: "yolo → main" },
    { icon: Coffee, label: "coffee_per_deploy", value: "2.5 cups" },
    { icon: Bug, label: "bugs_created", value: "features" },
    { icon: Zap, label: "uptime_motivation", value: "99.9%" },
  ];

  return (
    <>
      {/* Hero Section */}
      <ModernHero avatarUrl={avatarUrl} />

      {/* About Section */}
      <section className="relative py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <span className="eyebrow">about_me.md</span>
              <h2 className="text-3xl md:text-4xl font-bold font-mono tracking-tight">
                <span className="tok-kw">function</span>{" "}
                <span className="tok-fn">whoAmI</span>() {"{"}
              </h2>
              <div className="pl-4 md:pl-6 border-l-2 border-border space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I&apos;m Mohsen Amini, a developer who lives at the intersection of AI and
                  the modern web. I turn ambitious ideas into shipped products — the kind
                  that make you go &quot;wait, how does that work?&quot; and then read the source.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Strong opinions about clean code, strongly-typed everything, and
                  meticulous attention to detail. Weak opinions about tabs vs spaces
                  (it&apos;s spaces, obviously).
                </p>
              </div>
              <p className="text-3xl md:text-4xl font-bold font-mono">{"}"}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-lg border border-border bg-card p-3.5 hover:border-primary/40 transition-colors duration-300">
                      <Icon className="w-4 h-4 text-primary mb-2" />
                      <p className="text-[10px] text-muted-foreground/70 truncate">{s.label}</p>
                      <p className="text-sm font-semibold truncate">{s.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code window */}
            <div className="term">
              {/* Title bar */}
              <div className="term-bar">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3">developer.ts — ~/mohsen</span>
              </div>
              <div className="font-mono text-sm space-y-1.5 p-6 leading-relaxed overflow-x-auto">
                <p><span className="text-muted-foreground/40 select-none mr-4">1</span><span className="tok-comment">{"/** The human behind the commits */"}</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">2</span><span className="tok-kw">const</span> <span className="tok-fn">developer</span> = {"{"}</p>
                <p><span className="text-muted-foreground/40 select-none mr-4">3</span><span className="pl-4"><span className="tok-var">name</span>: <span className="tok-str">&quot;Mohsen Amini&quot;</span>,</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">4</span><span className="pl-4"><span className="tok-var">skills</span>: [<span className="tok-str">&quot;AI&quot;</span>, <span className="tok-str">&quot;Web Dev&quot;</span>, <span className="tok-str">&quot;UI/UX&quot;</span>],</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">5</span><span className="pl-4"><span className="tok-var">passion</span>: <span className="tok-num">Infinity</span>,</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">6</span><span className="pl-4"><span className="tok-var">coffee</span>: <span className="tok-ok">true</span>,</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">7</span><span className="pl-4"><span className="tok-var">bugs</span>: <span className="tok-comment">{"undefined /* trust me */"}</span>,</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">8</span>{"}"} <span className="tok-kw">as const</span>;</p>
                <p><span className="text-muted-foreground/40 select-none mr-4">9</span></p>
                <p><span className="text-muted-foreground/40 select-none mr-4">10</span><span className="tok-kw">export default</span> <span className="tok-fn">developer</span>; <span className="inline-block w-2 h-4 bg-primary/70 animate-blink align-middle" /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section — the six most recently updated GitHub repos */}
      <section id="projects" className="relative py-28 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <span className="eyebrow mb-4">featured builds</span>
            <h2 className="text-3xl md:text-5xl font-bold font-mono tracking-tight mb-4 mt-4">
              ls <span className="text-primary">~/projects</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              My six most recent repositories, pulled straight from the GitHub API.
              AI, web apps, and creative problem-solving — whatever I pushed last is
              what shows up here.
            </p>
          </div>

          {/* Streams in after the rest of the page: the GitHub API round-trip
              no longer blocks the HTML from being sent. */}
          <Suspense fallback={<ReposSkeleton />}>
            <GitHubRepos username={GITHUB_USERNAME} />
          </Suspense>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="term">
            <div className="term-bar">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3">contact.sh — ~/mohsen</span>
            </div>

            <div className="p-8 md:p-12 text-center space-y-7">
              <p className="font-mono text-sm text-muted-foreground">
                <span className="tok-ok">➜</span> <span className="tok-fn">~</span> ./collaborate.sh --with mohsen
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-mono tracking-tight">
                Let&apos;s build something<br />
                <span className="text-primary">{"<"}</span>Amazing <span className="text-primary">{"/>"}</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                Got a project in mind? An idea that needs a keyboard warrior?
                My inbox compiles without errors.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-1">
                <Link
                  href="mailto:mohsenamini1081@gmail.com"
                  className="keycap group px-6 py-3.5 font-mono font-semibold text-sm flex items-center gap-2 bg-primary text-primary-foreground border-primary/60 hover:border-primary"
                >
                  <Mail className="w-4 h-4" />
                  sendmail mohsen
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform duration-300" />
                </Link>

                <LazyContactPopover />
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3 pt-4">
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
                    className="keycap w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary"
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
        </div>
      </section>

      {/* Footer — vim statusline style */}
      <footer className="px-4 pb-6">
        <div className="container mx-auto max-w-7xl">
          <div className="rounded-lg border border-border bg-card font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">NORMAL</span>
                <span className="text-muted-foreground hidden sm:inline">portfolio.tsx</span>
                <span className="tok-ok hidden md:inline">✓ no errors</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="hidden sm:inline"><GitBranch className="w-3 h-3 inline mr-1" />main</span>
                <span>© {new Date().getFullYear()} mhsenam</span>
                <span className="hidden md:inline">utf-8</span>
                <span className="tok-fn">100%</span>
              </div>
            </div>
          </div>
          <p className="text-center font-mono text-[11px] text-muted-foreground/50 mt-3">
            {"// built with next.js + gsap, powered by caffeine and ctrl+z"}
          </p>
        </div>
      </footer>
    </>
  );
}

/** Placeholder streamed while the GitHub API round-trip resolves. */
function ReposSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="term p-5">
          <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          <div className="mt-3 h-3 w-full rounded bg-muted/60 animate-pulse" />
          <div className="mt-2 h-3 w-5/6 rounded bg-muted/60 animate-pulse" />
          <div className="mt-5 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted/60 animate-pulse" />
            <div className="h-5 w-12 rounded-full bg-muted/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
