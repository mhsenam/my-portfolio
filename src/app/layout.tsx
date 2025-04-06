import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { AnimatedDottedBackground } from "@/components/animated-background";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Mohsen Amini - AI Specialist",
  description: "Portfolio of Mohsen Amini, AI Specialist & Innovator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatedDottedBackground />
          <Navbar />
          <main className="pt-16 relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
