import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../../index";
import type { PixabayImage, FeedItem } from "./types";
import {
  PIXABAY_API_KEY,
  PIXABAY_API_URL,
  FEED_TYPES
} from "../../constants/pixabay";
import {
  createInitialFeed,
  updateFeedWithImages,
  updateFeedWithError
} from "../../utils";

export class IntegrationService {
  private async fetchPixabayImages(query: string): Promise<PixabayImage[]> {
    const url = `${PIXABAY_API_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.hits;
  }

  async createFeed(searchText: string): Promise<string> {
    const feedId = uuidv4();
    const initialFeed = createInitialFeed();

    await redisClient.set(feedId, JSON.stringify(initialFeed));

    this.processFeed(feedId, searchText).catch((error) => {
      console.error("Error processing feed:", error);
    });

    return feedId;
  }

  private async processFeed(feedId: string, searchText: string): Promise<void> {
    try {
      const [regularImages, graffitiImages] = await Promise.all([
        this.fetchPixabayImages(searchText),
        this.fetchPixabayImages(`${searchText} graffiti`),
      ]);

      const updatedFeed = await this.updateFeedInRedis(feedId, (feed) => {
        feed = updateFeedWithImages(feed, regularImages, FEED_TYPES.REGULAR);
        feed = updateFeedWithImages(feed, graffitiImages, FEED_TYPES.GRAFFITI);
        return feed;
      });

      await redisClient.set(feedId, JSON.stringify(updatedFeed));
    } catch (error) {
      await this.handleFeedError(feedId);
    }
  }

  private async updateFeedInRedis(feedId: string, updateFn: (feed: FeedItem[]) => FeedItem[]): Promise<FeedItem[]> {
    const feedJson = await redisClient.get(feedId);
    if (!feedJson) throw new Error(`Feed not found: ${feedId}`);

    const feed: FeedItem[] = JSON.parse(feedJson);
    return updateFn(feed);
  }

  private async handleFeedError(feedId: string): Promise<void> {
    const updatedFeed = await this.updateFeedInRedis(feedId, (feed) => {
      feed = updateFeedWithError(feed, FEED_TYPES.REGULAR);
      feed = updateFeedWithError(feed, FEED_TYPES.GRAFFITI);
      return feed;
    });

    await redisClient.set(feedId, JSON.stringify(updatedFeed));
  }

  async getFeed(feedId: string): Promise<FeedItem[]> {
    const feed = await redisClient.get(feedId);
    return feed ? JSON.parse(feed) : [];
  }
}
