import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  description: string | null;
  tags: string[];
  slug: string;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      passHref
      className="block h-full group"
    >
      <Card
        className="h-full flex flex-col transition-shadow cursor-pointer 
                   overflow-visible
                   pixel-border pixel-border-glow"
      >
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            {article.title}
          </CardTitle>
          <CardDescription className="text-sm pt-1 h-10 overflow-hidden text-ellipsis">
            {article.description || "No description available."}
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
  );
}
