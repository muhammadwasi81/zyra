import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/students";
import taskRoutes from "./routes/tasks";
import { requestId } from "./middleware/requestId";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

dotenv.config();

// Render's fromService.host gives a bare hostname with no scheme.
// Prepend https:// when the value has no protocol prefix.
const rawOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const FRONTEND_ORIGIN = rawOrigin.startsWith("http") ? rawOrigin : `https://${rawOrigin}`;

export const app = express();

app.use(requestId);
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(logger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/students", studentRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);
