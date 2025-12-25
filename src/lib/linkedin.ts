import { headers } from "next/headers";

/**
 * Fetch the latest LinkedIn profile photo for mhsenam
 *
 * This function calls the internal API route that uses a proxy
 * to bypass LinkedIn's restrictions and returns the profile picture URL.
 *
 * @returns Promise<string> - The URL of the profile picture
 */
export async function getLinkedInProfilePhoto(): Promise<string | null> {
  try {
    // Get the host from headers to construct absolute URL
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const response = await fetch(`${protocol}://${host}/api/get-linkedin-photo`, {
      // Use Next.js caching - revalidate every hour to get fresh updates
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Failed to fetch LinkedIn photo via API");
      return null;
    }

    const data = await response.json();
    return data.profilePictureUrl || null;
  } catch (error) {
    console.error("Error fetching LinkedIn profile photo:", error);
    return null;
  }
}

/**
 * Combined function that tries LinkedIn first, falls back to GitHub
 *
 * @param githubUsername - GitHub username for fallback
 * @returns Promise<string> - The URL of the profile picture
 */
export async function getProfilePhoto(
  githubUsername: string = "mhsenam"
): Promise<string> {
  // Try LinkedIn first
  const linkedinPhoto = await getLinkedInProfilePhoto();
  if (linkedinPhoto) {
    return linkedinPhoto;
  }

  // Fallback to GitHub
  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.avatar_url || `https://github.com/${githubUsername}.png`;
    }
  } catch (e) {
    console.error("GitHub fallback also failed:", e);
  }

  // Final fallback
  return `https://github.com/${githubUsername}.png`;
}
