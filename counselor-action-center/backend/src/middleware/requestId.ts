import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request to carry a request ID throughout the lifecycle
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
