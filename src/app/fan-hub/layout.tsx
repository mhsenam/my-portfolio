import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fan Hub — Community",
  description:
    "The mhsenam community hub: read and share posts, replies and likes with other fans of Mohsen Amini's work.",
  alternates: { canonical: "https://mhsenam.com/fan-hub" },
  openGraph: {
    title: "Fan Hub — Community | Mohsen Amini",
    description:
      "Read and share posts with the mhsenam community.",
    url: "https://mhsenam.com/fan-hub",
  },
};

export default function FanHubLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
