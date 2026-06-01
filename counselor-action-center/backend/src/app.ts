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

// Build the list of allowed CORS origins.
// 1. FRONTEND_ORIGIN env var (Render injects a bare hostname via fromService.host,
//    so we prepend https:// when there is no scheme).
// 2. localhost for local development.
// 3. Any *.onrender.com origin as a safety net in case fromService is not resolved.
function buildAllowedOrigins(): string[] {
  const origins = ["http://localhost:5173"];

  const raw = process.env.FRONTEND_ORIGIN;
  if (raw) {
    origins.push(raw.startsWith("http") ? raw : `https://${raw}`);
  }

  return origins;
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

export const app = express();

app.use(requestId);
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow server-to-server requests (no Origin header) and allowed origins.
      // Also allow any *.onrender.com subdomain so Render preview URLs work.
      if (
        !incomingOrigin ||
        ALLOWED_ORIGINS.includes(incomingOrigin) ||
        incomingOrigin.endsWith(".onrender.com")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${incomingOrigin} not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(logger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/students", studentRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);
