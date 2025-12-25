import { ModernHero } from "@/components/modern-hero";
import { ModernProjectCard, ProjectInfo } from "@/components/modern-project-card";
import { CustomCursor } from "@/components/custom-cursor";
import { ContactPopover } from "@/components/contact-popover";
import { GitHubRepos } from "@/components/github-repos";
import { Mail, ArrowUpRight } from "lucide-react";
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

  return (
    <>
      <CustomCursor />

      {/* Hero Section */}
      <ModernHero avatarUrl={avatarUrl} />

      {/* About Section */}
      <section className="relative py-32 px-4 noise">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                About Me
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-heading">
                Crafting Digital
                <span className="text-gradient"> Experiences</span>
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
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative glass rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="font-mono text-sm space-y-2">
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">developer</span> = {"{}"}</p>
                  <p className="pl-4"><span className="text-green-400">name</span>: <span className="text-yellow-400">{"\"Mohsen Amini\""}</span>,</p>
                  <p className="pl-4"><span className="text-green-400">skills</span>: [<span className="text-yellow-400">{"\"AI\""}</span>, <span className="text-yellow-400">{"\"Web Dev\""}</span>, <span className="text-yellow-400">{"\"UI/UX\""}</span>],</p>
                  <p className="pl-4"><span className="text-green-400">passion</span>: <span className="text-purple-400">Infinity</span>,</p>
                  <p className="pl-4"><span className="text-green-400">coffee</span>: <span className="text-orange-400">true</span></p>
                  <p>{"\"}\";"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Featured Work
            </span>
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4">
              Selected <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A collection of projects showcasing my skills in AI, web development, and creative problem-solving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <ModernProjectCard key={i} project={project} index={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="https://github.com/mhsenam?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              View All Projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GitHub Repos Section */}
      <section className="relative py-32 px-4 noise">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Open Source
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Latest <span className="text-gradient">Contributions</span>
            </h2>
          </div>
          <GitHubRepos username="mhsenam" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="glass rounded-3xl p-12 text-center space-y-8">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading">
              Let&apos;s Build Something <span className="text-gradient">Amazing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I&apos;m always open to discussing new ideas and opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="mailto:mohsenamini1081@gmail.com"
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/30"
              >
                <Mail className="w-5 h-5" />
                Send Email
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform duration-300" />
              </Link>

              <ContactPopover />
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4 pt-8">
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
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
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
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-7xl text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Mohsen Amini. Built with Next.js, GSAP & lots of coffee.</p>
        </div>
      </footer>
    </>
  );
}
