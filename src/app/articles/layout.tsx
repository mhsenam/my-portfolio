import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles & Tutorials",
  description:
    "Technical articles and tutorials by Mohsen Amini (mhsenam) on Next.js, React, TypeScript and AI integration.",
  alternates: { canonical: "https://mhsenam.com/articles" },
  openGraph: {
    title: "Articles & Tutorials — Mohsen Amini",
    description:
      "Technical articles and tutorials on Next.js, React, TypeScript and AI integration.",
    url: "https://mhsenam.com/articles",
  },
};

export default function ArticlesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
