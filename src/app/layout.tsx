import type { Metadata } from "next";
import { Poppins, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Navbar } from "@/components/navbar";
import { AnimatedDottedBackground } from "@/components/animated-background";
import ScrollProgressBar from "@/components/scroll-progress-bar";
import Head from "next/head";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Mohsen Amini - AI Specialist & Web Developer | mhsenam",
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
  alternates: {
    canonical: "https://mhsenam.com/",
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
  themeColor: "#10172a",
  other: {
    "msapplication-TileColor": "#10172a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
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
      </Head>
      <body className={`${poppins.variable} ${lato.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatedDottedBackground />
          <Navbar />
          <ScrollProgressBar />
          <main className="pt-16 relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
