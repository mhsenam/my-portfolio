import type { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const SITE = "https://mhsenam.com";

/**
 * Per-post titles / Open Graph cards so shared post links render properly.
 * The lookup is capped so a slow Firestore response can never hold the HTML
 * hostage — crawlers and visitors get generic metadata instead of a wait.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const url = `${SITE}/post/${postId}`;

  const fallback: Metadata = {
    title: "Community post",
    alternates: { canonical: url },
  };

  try {
    const postSnap = await Promise.race([
      getDoc(doc(db, "posts", postId)),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);

    if (!postSnap || !postSnap.exists()) return fallback;

    const post = postSnap.data() as {
      title?: string;
      description?: string;
      imageUrl?: string | null;
      authorName?: string;
    };

    return {
      title: post.title || "Community post",
      description: post.description?.slice(0, 160),
      alternates: { canonical: url },
      openGraph: {
        title: post.title ? `${post.title} — mhsenam Fan Hub` : undefined,
        description: post.description?.slice(0, 160),
        url,
        type: "article",
        images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
      },
      twitter: {
        card: post.imageUrl ? "summary_large_image" : "summary",
        title: post.title,
        description: post.description?.slice(0, 160),
      },
    };
  } catch {
    return fallback;
  }
}

export default function PostLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
