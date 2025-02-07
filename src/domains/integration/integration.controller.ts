import type { Request, Response } from "express";
import { IntegrationService } from "./integration.service";

export class IntegrationController {
  private service: IntegrationService;

  constructor() {
    this.service = new IntegrationService();
  }

  async createFeed(req: Request, res: Response): Promise<void> {
    try {
      const { searchText } = req.body;

      if (!searchText || typeof searchText !== "string") {
        res.status(400).json({ error: "Search text is required" });
        return;
      }

      const feedId = await this.service.createFeed(searchText);
      res.json({ feedId });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const feed = await this.service.getFeed(id);

      if (!feed.length) {
        res.status(404).json({ error: "Feed not found" });
        return;
      }

      res.json(feed);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

