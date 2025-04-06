import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BrainCircuit,
  Code,
  Bot,
  Mail,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react"; // Example icons
import Link from "next/link";
import { GitHubRepos } from "@/components/github-repos"; // Import the new component
import { AnimatedText } from "@/components/animated-text"; // Import AnimatedText
import { ContactPopover } from "@/components/contact-popover"; // Import the popover

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-16 md:p-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto border-4 border-primary shadow-lg">
            <AvatarImage
              src={avatarUrl} // Use the dynamic avatar URL
              alt={username} // Use username for alt text
            />
            {/* Fallback initials */}
            <AvatarFallback>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <AnimatedText
            el="h1"
            text="Mohsen Amini: AI Specialist & Innovator"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-primary"
            colorful={true}
            wordAnimation={true}
            staggerChildren={0.15}
          />
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Hi, I&apos;m Mohsen Amini. I leverage artificial intelligence to
            solve complex problems and drive business growth. Explore the future
            of AI with me.
          </p>
          {/* Social Links */}
          <div className="flex justify-center space-x-4 pt-2">
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
          <ContactPopover />
        </section>

        {/* Features Section */}
        <section className="text-center">
          <AnimatedText
            el="h2"
            text="Core Services"
            className="text-3xl sm:text-4xl font-bold text-primary mb-12"
            wordAnimation={true}
          />
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-primary" />
                <CardTitle className="mt-4 text-xl sm:text-2xl font-semibold">
                  Machine Learning Models
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Developing and deploying bespoke ML models tailored to your
                specific data and challenges.
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-primary" />
                <CardTitle className="mt-4 text-xl sm:text-2xl font-semibold">
                  AI-Powered Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Building intelligent applications that automate processes and
                provide insightful analytics.
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-primary" />
                <CardTitle className="mt-4 text-xl sm:text-2xl font-semibold">
                  AI Strategy & Consulting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Guiding businesses on integrating AI effectively to achieve
                strategic objectives.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <AnimatedText
            el="h2"
            text="About Me"
            className="text-3xl sm:text-4xl font-bold text-primary"
            wordAnimation={true}
          />
          <p className="text-base sm:text-lg text-muted-foreground">
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
            className="text-3xl sm:text-4xl font-bold text-primary"
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
