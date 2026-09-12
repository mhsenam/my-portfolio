/**
 * Live GitHub profile photo.
 *
 * The hero avatar is not a committed snapshot: it comes from the GitHub API so
 * the site shows whatever github.com/mhsenam currently uses as a profile
 * picture — no file swap or redeploy when it changes.
 *
 * Two layers keep it current:
 *  1. `getProfilePhoto()` — server-side, seeds the SSR HTML, cached for one
 *     hour (same window as the repo list in components/github-repos.ts).
 *  2. `fetchCurrentGitHubAvatar()` — uncached, called once per visit from the
 *     browser by the hero, so an avatar changed minutes ago still shows up on
 *     the next visit even inside the server cache window.
 *
 * Both fall back gracefully (bundled photo / keep the SSR value) so the hero
 * is never blank.
 */

export const GITHUB_USERNAME = "mhsenam";

const FALLBACK_PHOTO = "/profile-photo.png";

/** Requested avatar resolution; GitHub serves any size up to the original. */
const AVATAR_SIZE = 512;

const HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

export async function getProfilePhoto(): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      next: { revalidate: 3600 }, // keep it current without hammering the API
      headers: HEADERS,
    });
    return (await parseAvatar(res)) ?? FALLBACK_PHOTO;
  } catch {
    // Network/DNS failure, rate limit, bad JSON — never break the hero.
    return FALLBACK_PHOTO;
  }
}

/** Uncached check used by the hero on every page visit (client-side). */
export async function fetchCurrentGitHubAvatar(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: HEADERS,
    });
    return parseAvatar(res);
  } catch {
    return null;
  }
}

async function parseAvatar(res: Response): Promise<string | null> {
  if (!res.ok) return null;
  const user = (await res.json()) as { avatar_url?: string };
  return user.avatar_url ? withAvatarSize(user.avatar_url) : null;
}

/** GitHub avatars accept an `s` query parameter for the rendered pixel size. */
function withAvatarSize(url: string, size: number = AVATAR_SIZE): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}s=${size}`;
}
