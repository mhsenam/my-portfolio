/**
 * Live GitHub profile photo.
 *
 * The hero avatar is no longer a committed snapshot: it is fetched from the
 * GitHub API so the site always shows whatever github.com/mhsenam currently
 * uses as a profile picture — no file swap or redeploy needed when it changes.
 *
 * The lookup is cached for one hour (the same window the rest of the GitHub
 * data on this site uses, see components/github-repos.ts). In development the
 * cache is bypassed, so a new avatar shows up on the next reload. If the API
 * is unreachable we fall back to the bundled photo so the hero is never blank.
 */

export const GITHUB_USERNAME = "mhsenam";

const FALLBACK_PHOTO = "/profile-photo.png";

/** Requested avatar resolution; GitHub serves any size up to the original. */
const AVATAR_SIZE = 512;

export async function getProfilePhoto(): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      next: { revalidate: 3600 }, // keep it current without hammering the API
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) return FALLBACK_PHOTO;

    const user = (await res.json()) as { avatar_url?: string };
    if (!user.avatar_url) return FALLBACK_PHOTO;

    return withSize(user.avatar_url, AVATAR_SIZE);
  } catch {
    // Network/DNS failure, rate limit, bad JSON — never break the hero.
    return FALLBACK_PHOTO;
  }
}

/** GitHub avatars accept an `s` query parameter for the rendered pixel size. */
function withSize(url: string, size: number): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}s=${size}`;
}
