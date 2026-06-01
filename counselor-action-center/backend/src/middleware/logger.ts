import morgan from "morgan";
import type { Handler } from "express";

// Attach the per-request ID to morgan's token stream
morgan.token("id", (req) => (req as { id?: string }).id ?? "-");

const format = "[:id] :method :url :status :res[content-length]b - :response-time ms";

// Suppress output during tests to keep the test runner output clean
export const logger: Handler =
  process.env.NODE_ENV === "test"
    ? (_req, _res, next) => next()
    : morgan(format);
