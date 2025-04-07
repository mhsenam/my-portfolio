import type { Metadata } from "next";
import { Poppins, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Navbar } from "@/components/navbar";
import { AnimatedDottedBackground } from "@/components/animated-background";

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
  title: "Mohsen Amini - AI Specialist & Web Developer",
  description: "Portfolio of Mohsen Amini, AI Specialist & Web Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${lato.variable} font-sans`}>
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
