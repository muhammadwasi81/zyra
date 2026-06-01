import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] [${req.id ?? "no-id"}] ${err.message}`);
  res.status(500).json({
    error: "Internal server error",
    requestId: req.id,
  });
}
