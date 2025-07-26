import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Star, GitFork, ExternalLink } from "lucide-react";

// Function to extract first paragraph (basic summary)
function summarizeReadme(markdown: string | null): string | null {
  if (!markdown) return null;
  // Remove front matter (if any)
  markdown = markdown.replace(/^---[\s\S]*?---/, "");
  // Find first meaningful paragraph (skip empty lines, headers, horizontal rules, etc.)
  const lines = markdown.split("\n");
  let summary = "";
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine &&
      !trimmedLine.startsWith("#") &&
      !trimmedLine.startsWith("-") &&
      !trimmedLine.startsWith("=") &&
      !trimmedLine.startsWith(">") &&
      !trimmedLine.startsWith("!") &&
      !trimmedLine.startsWith("[")
    ) {
      summary = trimmedLine;
      break;
    }
  }
  // Limit length
  return summary.length > 150
    ? summary.substring(0, 150) + "..."
    : summary || null;
}

interface GitHubRepo {
  id: number;
  name: string;
  owner: { login: string }; // Need owner login for README fetch
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  readmeSummary?: string | null; // Add readme summary field
}

async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  let repos: GitHubRepo[] = [];
  try {
    // Fetch initial repo list
    const repoListResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=3`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          // Recommended header for GitHub API
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!repoListResponse.ok) {
      console.error(
        `GitHub API Error (Repo List): ${repoListResponse.status} ${repoListResponse.statusText}`
      );
      return [];
    }

    repos = (await repoListResponse.json()) as GitHubRepo[];

    // Fetch README for each repo
    const readmePromises = repos.map(async (repo) => {
      try {
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`,
          {
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
              // Request raw markdown content
              Accept: "application/vnd.github.v3.raw",
              // Alternative: 'application/vnd.github.v3+json' to get encoded content
            },
          }
        );

        if (readmeResponse.ok) {
          const readmeContent = await readmeResponse.text(); // Get raw text
          repo.readmeSummary = summarizeReadme(readmeContent);
        } else {
          console.warn(
            `Could not fetch README for ${repo.name}: ${readmeResponse.status}`
          );
          repo.readmeSummary = null;
        }
      } catch (readmeError) {
        console.error(`Error fetching README for ${repo.name}:`, readmeError);
        repo.readmeSummary = null;
      }
      return repo;
    });

    // Wait for all README fetches to complete
    repos = await Promise.all(readmePromises);
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return []; // Return empty array on error
  }
  return repos;
}

export async function GitHubRepos({ username }: { username: string }) {
  const repos = await getGitHubRepos(username);

  if (!repos || repos.length === 0) {
    return (
      <section className="text-center py-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
          My GitHub Projects
        </h2>
        <p className="text-muted-foreground">
          Could not fetch repositories or none found.
        </p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-8">
        My Latest GitHub Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <Card
            key={repo.id}
            className="group relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow
                       before:absolute before:inset-0 before:-translate-x-full 
                       group-hover:before:animate-[shimmer_1.5s_ease-out] /* Animate only on hover */
                       before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent"
          >
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                {repo.name}
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on GitHub"
                >
                  <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              </CardTitle>
              {/* Use readmeSummary first, then description, then fallback */}
              <CardDescription className="h-16 text-sm overflow-hidden text-ellipsis">
                {repo.readmeSummary ||
                  repo.description ||
                  "No description available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {repo.language && (
                <p className="text-sm text-muted-foreground mb-2">
                  Language: {repo.language}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-start space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" /> {repo.stargazers_count}
              </div>
              <div className="flex items-center">
                <GitFork className="h-4 w-4 mr-1" /> {repo.forks_count}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href={`https://github.com/${username}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          View All Repositories on GitHub
        </Link>
      </div>
    </section>
  );
}
