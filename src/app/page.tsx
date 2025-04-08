import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Github, Linkedin, Twitter } from "lucide-react"; // Example icons
import Link from "next/link";
import { GitHubRepos } from "@/components/github-repos"; // Import the new component
import { AnimatedText } from "@/components/animated-text"; // Import AnimatedText
import { ContactPopover } from "@/components/contact-popover"; // Import the popover
import { AnimatedCard } from "@/components/animated-card"; // Import AnimatedCard
import { AnimatedHero } from "@/components/animated-hero"; // Import AnimatedHero
import { ArticleCard } from "@/components/article-card"; // Import ArticleCard
import LatestVideos from "@/components/latest-videos"; // Import the component

// Static data for example articles (same as in articles/page.tsx)
const staticArticles = [
  {
    id: 1,
    title: "The Future of AI in Web Development",
    description:
      "Exploring how AI is reshaping the landscape of creating websites and applications.",
    tags: ["AI", "Web Development", "Future Tech"],
    slug: "future-of-ai-in-web-dev",
  },
  {
    id: 2,
    title: "Getting Started with GSAP Animations",
    description:
      "A beginner's guide to creating smooth and performant animations with GSAP.",
    tags: ["GSAP", "Animation", "JavaScript"],
    slug: "getting-started-with-gsap",
  },
  {
    id: 3,
    title: "Building Modern UIs with shadcn/ui",
    description:
      "Leveraging shadcn/ui components for accessible and visually appealing interfaces.",
    tags: ["shadcn/ui", "React", "UI/UX"],
    slug: "building-with-shadcn-ui",
  },
  {
    id: 4,
    title: "Optimizing Next.js Apps",
    description:
      "Tips and tricks for improving the performance and speed of your Next.js applications.",
    tags: ["Next.js", "Performance", "Optimization"],
    slug: "optimizing-nextjs-apps",
  },
];

// Function to fetch GitHub user data
async function getGitHubUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      console.error(
        `GitHub API Error (User): ${response.status} ${response.statusText}`
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub user:", error);
    return null;
  }
}

// Make component async
export default async function Home() {
  const username = "mhsenam";
  const githubUser = await getGitHubUser(username);
  // Use fetched URL or fallback
  const avatarUrl = githubUser?.avatar_url || "https://github.com/shadcn.png";

  // Get latest 3 articles
  const latestArticles = staticArticles.slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-16 md:p-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 space-y-16 sm:space-y-24">
        {/* Hero Section - Wrap with AnimatedHero */}
        <AnimatedHero className="text-center space-y-6">
          {/* Increase Avatar size */}
          <Avatar className="w-32 h-32 sm:w-40 sm:h-40 mx-auto border-4 border-primary shadow-lg hero-avatar">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Add hero-headline class */}
          <AnimatedText
            el="h1"
            text="Mohsen Amini: AI Specialist & Web Developer"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-primary hero-headline font-heading"
            colorful={true}
            wordAnimation={true}
            staggerChildren={0.15}
          />
          {/* Add hero-paragraph class */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto hero-paragraph">
            Hi, I&apos;m Mohsen Amini. I leverage artificial intelligence to
            solve complex problems and drive business growth. Explore the future
            of AI with me.
          </p>
          {/* Social Links - Add hero-social class to container */}
          <div className="flex justify-center space-x-4 pt-2 hero-social">
            <Link
              href="https://www.linkedin.com/in/mhsenam/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Linkedin className="h-6 w-6" />
              </Button>
            </Link>
            <Link
              href="https://github.com/mhsenam"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Github className="h-6 w-6" />
              </Button>
            </Link>
            <Link
              href="https://x.com/Mhsenam"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Twitter className="h-6 w-6" />
              </Button>
            </Link>
          </div>
          {/* Add hero-popover class to Popover container (might need adjustment if structure changes) */}
          <div className="hero-popover inline-block">
            {" "}
            {/* Added wrapper div for targeting */}
            <ContactPopover />
          </div>
        </AnimatedHero>

        {/* Latest Articles Section */}
        <section className="text-center">
          <AnimatedText
            el="h2"
            text="Latest Articles"
            className="text-3xl sm:text-4xl font-bold text-primary mb-12 font-heading"
            wordAnimation={true}
          />
          <div className="grid md:grid-cols-3 gap-8">
            {latestArticles.map((article, index) => (
              <AnimatedCard key={article.id} index={index}>
                <ArticleCard article={article} />
              </AnimatedCard>
            ))}
          </div>
          {/* Optional: Link to all articles */}
          <div className="mt-12">
            <Link href="/articles">
              <Button variant="outline">View All Articles</Button>
            </Link>
          </div>
        </section>

        {/* Add Latest Videos Section */}
        <LatestVideos />

        {/* About Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <AnimatedText
            el="h2"
            text="About Me"
            className="text-3xl sm:text-4xl font-bold text-primary font-heading"
            wordAnimation={true}
          />
          <p className="text-base sm:text-lg text-muted-foreground text-justify leading-relaxed">
            I&apos;m Mohsen Amini, a front-end developer passionate about
            blending high-performance web development with the power of
            Artificial Intelligence. I specialize in integrating AI into
            development workflows to boost efficiency and create smarter, more
            innovative user experiences. From AI-driven web automation to
            enhancing user interactions, I thrive on leveraging cutting-edge AI
            tech to solve complex problems and build seamless, intuitive digital
            solutions.
          </p>
        </section>

        {/* GitHub Repos Section */}
        <GitHubRepos username={username} />

        {/* Contact Section */}
        <section className="text-center space-y-6">
          <AnimatedText
            el="h2"
            text="Let's Collaborate"
            className="text-3xl sm:text-4xl font-bold text-primary font-heading"
            wordAnimation={true}
          />
          <p className="text-base sm:text-lg text-muted-foreground">
            Interested in discussing an AI project or learning more about my
            services?
          </p>
          <Link href="mailto:mohsenamini1081@gmail.com">
            <Button variant="outline" size="lg" className="cursor-pointer">
              <Mail className="mr-2 h-5 w-5" /> Contact Me
            </Button>
          </Link>
        </section>
      </div>
    </main>
  );
}
