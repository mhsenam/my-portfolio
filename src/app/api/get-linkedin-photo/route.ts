import { NextResponse } from "next/server";

const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/mhsenam/";

/**
 * API Route to fetch the latest LinkedIn profile photo
 *
 * This route uses a proxy service to bypass LinkedIn's restrictions
 * and extracts the profile picture URL from the page's metadata.
 */
export async function GET() {
  try {
    // Try using nubela.co/proxycurl API (LinkedIn profile API)
    // Or use a simpler approach with corsproxy.io
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(LINKEDIN_PROFILE_URL)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`Proxy returned status: ${response.status}, using fallback`);
      return NextResponse.json({
        profilePictureUrl: "https://github.com/mhsenam.png",
        source: "fallback",
      });
    }

    const html = await response.text();

    // Try multiple methods to extract the profile picture URL

    // Method 1: Look for JSON-LD data (using non-dotall mode for compatibility)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      try {
        const jsonLdData = JSON.parse(jsonLdMatch[1]);
        if (jsonLdData?.image?.url) {
          return NextResponse.json({
            profilePictureUrl: jsonLdData.image.url,
            source: "json-ld",
          });
        }
      } catch {
        // Continue to next method
      }
    }

    // Method 2: Look for Open Graph image meta tag
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch) {
      return NextResponse.json({
        profilePictureUrl: ogImageMatch[1],
        source: "og-image",
      });
    }

    // Method 3: Look for Twitter image meta tag
    const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/);
    if (twitterImageMatch) {
      return NextResponse.json({
        profilePictureUrl: twitterImageMatch[1],
        source: "twitter-image",
      });
    }

    // If all methods fail, return fallback
    return NextResponse.json({
      profilePictureUrl: "https://github.com/mhsenam.png",
      source: "fallback",
    });
  } catch (error) {
    console.error("Error fetching LinkedIn profile photo:", error);
    return NextResponse.json({
      profilePictureUrl: "https://github.com/mhsenam.png",
      source: "error-fallback",
    });
  }
}
