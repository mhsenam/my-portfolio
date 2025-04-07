"use client"; // Make it a client component

import React, { useState, useEffect } from "react"; // Import hooks
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { AnimatedCard } from "@/components/animated-card"; // Import AnimatedCard

// Static data for example articles (keep outside component)
const staticArticles = [
  {
    id: 1,
    title: "The Future of AI in Web Development",
    description:
      "Exploring how AI is reshaping the landscape of creating websites and applications.",
    tags: ["AI", "Web Development", "Future Tech"],
    slug: "future-of-ai-in-web-dev", // Example slug for link
  },
  {
    id: 2,
    title: "Getting Started with GSAP Animations",
    description:
      "A beginner's guide to creating smooth and performant animations with GSAP.",
    tags: ["GSAP", "Animation", "JavaScript"],
    slug: "getting-started-with-gsap",
  },
  {
    id: 3,
    title: "Building Modern UIs with shadcn/ui",
    description:
      "Leveraging shadcn/ui components for accessible and visually appealing interfaces.",
    tags: ["shadcn/ui", "React", "UI/UX"],
    slug: "building-with-shadcn-ui",
  },
  {
    id: 4,
    title: "Optimizing Next.js Apps",
    description:
      "Tips and tricks for improving the performance and speed of your Next.js applications.",
    tags: ["Next.js", "Performance", "Optimization"],
    slug: "optimizing-nextjs-apps",
  },
];

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState(staticArticles);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = staticArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerCaseQuery) ||
        article.description.toLowerCase().includes(lowerCaseQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredArticles(filtered);
  }, [searchQuery]); // Re-run effect when searchQuery changes

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <h1 className="text-4xl font-heading font-bold mb-8 text-center text-primary">
        My Articles
      </h1>

      {/* Search Bar */}
      <div className="mb-12 max-w-md mx-auto relative">
        <Input
          type="search"
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border"
          value={searchQuery} // Bind value to state
          onChange={(e) => setSearchQuery(e.target.value)} // Update state on change
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Map over filtered articles */}
        {filteredArticles.map((article, index) => (
          // Wrap with AnimatedCard
          <AnimatedCard key={article.id} index={index}>
            <Link
              href={`/articles/${article.slug}`}
              passHref
              className="block h-full"
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm pt-1">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {/* Optionally add more content here */}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </CardFooter>
              </Card>
            </Link>
          </AnimatedCard>
        ))}
      </div>

      {/* Handle No Results */}
      {filteredArticles.length === 0 && searchQuery && (
        <p className="text-center text-muted-foreground mt-12">
          No articles found matching your search.
        </p>
      )}
    </div>
  );
}
