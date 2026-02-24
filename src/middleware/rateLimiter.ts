import { Response, NextFunction } from "express";
import { AuthRequest } from "../shared/types";

/**
 * In-memory sliding window rate limiter for read tracking.
 * Prevents the same user/IP from generating excessive ReadLog entries
 * for the same article (e.g., by refreshing the page rapidly).
 *
 * Key: `${identifier}:${articleId}`
 * Window: configurable (default 30 seconds)
 *
 * This does NOT block the article response — it sets a flag on the request
 * that the controller checks before logging the read.
 */

const readTimestamps = new Map<string, number>();

const CLEANUP_INTERVAL = 60_000; // 1 minute
const WINDOW_MS = 30_000; // 30 seconds

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of readTimestamps) {
    if (now - timestamp > WINDOW_MS) {
      readTimestamps.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function readRateLimiter(
  req: AuthRequest & { skipReadLog?: boolean },
  _res: Response,
  next: NextFunction
) {
  const articleId = req.params.id as string;
  const identifier = req.user?.sub ?? req.ip ?? "unknown";
  const key = `${identifier}:${articleId}`;

  const lastRead = readTimestamps.get(key);
  const now = Date.now();

  if (lastRead && now - lastRead < WINDOW_MS) {
    req.skipReadLog = true;
  } else {
    readTimestamps.set(key, now);
    req.skipReadLog = false;
  }

  next();
}
