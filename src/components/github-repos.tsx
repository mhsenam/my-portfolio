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

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=6`, // Fetch latest 6 repos
      {
        // Optional: Add revalidation if needed, e.g., next: { revalidate: 3600 } for hourly updates
        cache: "no-store", // Ensures data is fetched fresh on every request
      }
    );

    if (!response.ok) {
      console.error(
        `GitHub API Error: ${response.status} ${response.statusText}`
      );
      // Optionally throw an error or return an empty array to handle gracefully
      // throw new Error('Failed to fetch GitHub repositories');
      return [];
    }

    const data = await response.json();
    return data as GitHubRepo[];
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return []; // Return empty array on error
  }
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
            className="flex flex-col justify-between hover:shadow-md transition-shadow"
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
              <CardDescription className="h-10 overflow-hidden text-ellipsis">
                {repo.description || "No description provided."}
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
