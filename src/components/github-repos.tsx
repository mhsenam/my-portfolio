import Link from "next/link";
import { Star, GitFork, ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

/** How many repositories the homepage "projects" section shows. */
const REPO_LIMIT = 6;

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
  return summary.length > 160
    ? summary.substring(0, 160) + "..."
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
  topics?: string[];
  pushed_at?: string | null;
  readmeSummary?: string | null; // Add readme summary field
}

async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  let repos: GitHubRepo[] = [];
  try {
    // Fetch initial repo list
    const repoListResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=${REPO_LIMIT}`,
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

/**
 * "Recent" projects section: the six most recently pushed repositories on
 * GitHub, rendered as terminal windows. Rendered on the server so the markup
 * (and the README blurbs) are in the HTML — no client-side waterfall.
 */
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
      {/* Fake command header */}
      <p className="font-mono text-sm text-muted-foreground mb-6 text-center">
        <span className="tok-ok">➜</span> <span className="tok-fn">~</span> gh
        repo list {username} --sort updated --limit {REPO_LIMIT}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo, i) => {
          // Topics are the closest thing to the old hand-written skill chips.
          const chips = (repo.topics ?? []).slice(0, 3);

          return (
            <Link
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-card-in term group relative flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/40"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Terminal bar as header */}
              <div className="term-bar justify-between">
                <span className="truncate text-foreground/80">
                  <span className="tok-ok">{username}</span>
                  <span className="text-muted-foreground/60">/</span>
                  {repo.name}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="font-mono text-xs text-muted-foreground/60 mb-2">
                  <span className="tok-comment">{"/** README.md */"}</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
                  {repo.readmeSummary ||
                    repo.description ||
                    "No description available."}
                </p>

                {/* Skills / topics as imports */}
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 text-[11px] rounded border border-border bg-secondary/60 text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors duration-300"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer meta — git style */}
                <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground pt-4 border-t border-border/60">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      {repo.language}
                    </span>
                  )}
                  {repo.pushed_at && (
                    <span className="flex items-center gap-1.5 text-muted-foreground/70">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNowStrict(new Date(repo.pushed_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <Star className="h-3.5 w-3.5" /> {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" /> {repo.forks_count}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-12">
        <Link
          href={`https://github.com/${username}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="keycap inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold hover:text-primary"
        >
          <span className="tok-comment">$</span> gh repo list --all
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
