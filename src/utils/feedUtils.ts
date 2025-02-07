import type { FeedItem, PixabayImage } from "../domains/integration/types";
import { FEED_SIZE } from "../constants/pixabay";

export function createInitialFeed(): FeedItem[] {
  return Array(FEED_SIZE).fill({
    regular: { state: "loading" },
    graffiti: { state: "loading" },
  });
}

export function updateFeedWithImages(
  feed: FeedItem[],
  images: PixabayImage[],
  type: "regular" | "graffiti",
): FeedItem[] {
  return feed.map((item, index) => ({
    ...item,
    [type]:
      index < images.length ? { image: images[index].webformatURL, tags: images[index].tags } : { state: "failed" },
  }));
}

export function updateFeedWithError(feed: FeedItem[], type: "regular" | "graffiti"): FeedItem[] {
  return feed.map((item) => ({
    ...item,
    [type]: { state: "failed" },
  }));
}

