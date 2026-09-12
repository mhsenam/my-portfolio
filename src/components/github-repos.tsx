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
        <p className="text-muted-foreground">
          Could not fetch repositories or none found.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <Link
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group gradient-border relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/15"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>

            <h3 className="text-lg font-bold font-heading mb-2 group-hover:text-primary transition-colors duration-300 truncate">
              {repo.name}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
              {repo.readmeSummary ||
                repo.description ||
                "No description available."}
            </p>

            {/* Footer meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/60">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[var(--glow-1)] to-[var(--glow-2)]" />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1 ml-auto">
                <Star className="h-4 w-4" /> {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" /> {repo.forks_count}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href={`https://github.com/${username}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-sm font-medium hover:border-primary/50 hover:text-primary transition-all duration-300 hover:scale-105"
        >
          View All Repositories
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
