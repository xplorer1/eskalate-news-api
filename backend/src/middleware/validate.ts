import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v4";
import { AppError } from "../shared/errors";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      throw AppError.badRequest("Validation failed", errors);
    }

    req.body = result.data;
    next();
  };
}
