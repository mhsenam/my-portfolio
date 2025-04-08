import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Youtube, UserPlus } from "lucide-react";

interface YouTubeVideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    publishedAt: string;
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}

interface YouTubeChannelSnippet {
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  customUrl?: string;
}

interface YouTubeChannelStatistics {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

interface YouTubeChannelItem {
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics: YouTubeChannelStatistics;
}

interface YouTubeChannelResponse {
  items: YouTubeChannelItem[];
}

async function getLatestVideos(
  apiKey: string | undefined,
  channelId: string,
  maxResults = 6
): Promise<YouTubeVideoItem[]> {
  if (!apiKey) {
    console.error("YouTube API key is missing.");
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API Error (Videos):", response.status, errorData);
      throw new Error(`API Error: ${response.status}`);
    }
    const data: YouTubeApiResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return [];
  }
}

async function getChannelDetails(
  apiKey: string | undefined,
  channelId: string
): Promise<YouTubeChannelItem | null> {
  if (!apiKey) {
    console.error("YouTube API key is missing.");
    return null;
  }

  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API Error (Channel):", response.status, errorData);
      throw new Error(`API Error: ${response.status}`);
    }
    const data: YouTubeChannelResponse = await response.json();
    return data.items && data.items.length > 0 ? data.items[0] : null;
  } catch (error) {
    console.error("Failed to fetch YouTube channel details:", error);
    return null;
  }
}

export default async function LatestVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCQ6TUhh6QVyvLsPxp2mPx_A"; // Your channel ID

  if (!apiKey) {
    console.error(
      "YouTube API key is not configured. Please set the YOUTUBE_API_KEY environment variable."
    );
    return (
      <section
        id="latest-videos"
        className="py-16 md:py-24 bg-gradient-to-tr from-background via-muted/10 to-background"
      >
        <div className="container text-center">
          <Youtube className="w-12 h-12 mx-auto mb-4 text-red-600/80" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            YouTube Videos
          </h2>
          <p className="text-sm text-muted-foreground">
            YouTube API Key is not configured.
          </p>
        </div>
      </section>
    );
  }

  let videos: YouTubeVideoItem[] = [];
  let channelDetails: YouTubeChannelItem | null = null;

  try {
    [videos, channelDetails] = await Promise.all([
      getLatestVideos(apiKey, channelId),
      getChannelDetails(apiKey, channelId),
    ]);
  } catch (error) {
    console.error("Failed to fetch YouTube data:", error);
    return (
      <section
        id="latest-videos"
        className="py-16 md:py-24 bg-gradient-to-tr from-background via-muted/10 to-background"
      >
        <div className="container text-center">
          <Youtube className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            Error Loading Videos
          </h2>
          <p className="text-sm text-muted-foreground">
            Could not fetch data from YouTube.
          </p>
        </div>
      </section>
    );
  }

  const formatSubscribers = (count: string): string => {
    try {
      const num = parseInt(count, 10);
      if (isNaN(num)) return "N/A";
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M subscribers`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K subscribers`;
      return `${num} subscribers`;
    } catch {
      return "N/A";
    }
  };

  const channelUrl = channelDetails?.snippet?.customUrl
    ? `https://www.youtube.com/${channelDetails.snippet.customUrl}`
    : `https://www.youtube.com/channel/${channelId}`;

  return (
    <section
      id="latest-videos"
      className="py-16 md:py-24 bg-gradient-to-tr from-background via-muted/10 to-background"
    >
      <div className="container">
        {channelDetails && (
          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 sm:gap-6 mb-12 border-b pb-8 border-border/30">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border flex-shrink-0">
              <AvatarImage
                src={channelDetails.snippet.thumbnails.medium?.url}
                alt={channelDetails.snippet.title}
              />
              <AvatarFallback>
                {channelDetails.snippet.title?.charAt(0) || "Y"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <h2 className="text-3xl font-bold mb-1 truncate">
                {channelDetails.snippet.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {formatSubscribers(channelDetails.statistics.subscriberCount)} •{" "}
                {channelDetails.statistics.videoCount} videos
              </p>
              <p className="text-sm text-muted-foreground mb-3 max-w-xl mx-auto sm:mx-0 line-clamp-2">
                {channelDetails.snippet.description}
              </p>
              <Link href={channelUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Subscribe
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!videos || videos.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {channelDetails
              ? "No recent videos found."
              : "Could not load video data."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {videos.map((video) => (
              <Link
                key={video.id.videoId}
                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="overflow-hidden h-full group border-border/30 hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="aspect-video overflow-hidden relative">
                      <Image
                        src={video.snippet.thumbnails.high.url}
                        alt={video.snippet.title}
                        fill={true}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <CardTitle className="text-sm font-semibold leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {video.snippet.title}
                      </CardTitle>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
