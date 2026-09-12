import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Navbar } from "@/components/navbar";
import ScrollProgressBar from "@/components/scroll-progress-bar";
import { CustomCursor } from "@/components/custom-cursor";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-code",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mhsenam.com"),
  title: {
    default: "Mohsen Amini - AI Specialist & Web Developer | mhsenam",
    template: "%s | Mohsen Amini",
  },
  description:
    "Official portfolio of Mohsen Amini (mhsenam): AI Specialist, Web Developer, and innovator. Explore projects, articles, and contact info. Expert in Next.js, React, and AI integration.",
  keywords: [
    "Mohsen Amini",
    "mhsenam",
    "AI Specialist",
    "Web Developer",
    "Next.js",
    "React",
    "Portfolio",
    "Artificial Intelligence",
    "Frontend Engineer",
    "Software Engineer",
    "Iranian Developer",
    "Open Source",
    "JavaScript",
    "TypeScript",
    "Tech Blog",
    "Personal Website",
  ],
  openGraph: {
    title: "Mohsen Amini - AI Specialist & Web Developer | mhsenam",
    description:
      "Official portfolio of Mohsen Amini (mhsenam): AI Specialist, Web Developer, and innovator. Explore projects, articles, and contact info.",
    url: "https://mhsenam.com/",
    siteName: "Mohsen Amini Portfolio",
    images: [
      {
        url: "/fan-hub-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Mohsen Amini Portfolio Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohsen Amini - AI Specialist & Web Developer | mhsenam",
    description:
      "Official portfolio of Mohsen Amini (mhsenam): AI Specialist, Web Developer, and innovator.",
    site: "@mhsenam",
    creator: "@mhsenam",
    images: ["/fan-hub-banner.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  other: {
    "msapplication-TileColor": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">

      <body className={`${jetbrainsMono.variable} ${inter.variable} font-sans noise`}>
        {/* Rendered as plain JSX: React hoists these into <head> during SSR.
            (They used to live in next/head, whose contents never made it into
            the App Router HTML output — the JSON-LD was silently missing.) */}
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Mohsen Amini",
              alternateName: "mhsenam",
              url: "https://mhsenam.com/",
              image: "https://mhsenam.com/fan-hub-banner.jpg",
              sameAs: [
                "https://github.com/mhsenam",
                "https://www.linkedin.com/in/mhsenam/",
                "https://x.com/Mhsenam",
              ],
              jobTitle: "AI Specialist & Web Developer",
              description:
                "Official portfolio of Mohsen Amini (mhsenam): AI Specialist, Web Developer, and innovator.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://mhsenam.com/",
              name: "Mohsen Amini Portfolio",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://mhsenam.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <ScrollProgressBar />
          <main className="relative z-10">{children}</main>
          {/* Mounted in the root layout (not per-page) so the cursor exists on
              every route and doesn't wait for a page's data to render. It hides
              the native cursor only once it is actually tracking the pointer. */}
          <CustomCursor />
        </ThemeProvider>
      </body>
    </html>
  );
}
