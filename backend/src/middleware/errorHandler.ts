import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors";
import { sendError } from "../shared/response";
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.errors, err.statusCode);
  }

  return sendError(
    res,
    "Internal server error",
    ["An unexpected error occurred"],
    500
  );
}
