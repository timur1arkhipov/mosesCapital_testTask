import express from "express";
import { createClient } from "redis";
import { integrationRouter } from "./domains/integration";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect().catch((err) => console.error('Redis connection error:', err));

app.use("/", integrationRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { redisClient };
