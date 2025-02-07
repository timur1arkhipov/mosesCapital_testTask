import { Router } from "express";
import { IntegrationController } from "./integration.controller";

export const integrationRouter = Router();
const controller = new IntegrationController();

integrationRouter.post("/feed", (req, res) => controller.createFeed(req, res));
integrationRouter.get("/feed/:id", (req, res) => controller.getFeed(req, res));
