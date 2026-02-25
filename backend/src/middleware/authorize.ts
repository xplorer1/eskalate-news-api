import { Response, NextFunction } from "express";
import { AppError } from "../shared/errors";
import { AuthRequest } from "../shared/types";

export function authorize(...roles: ("author" | "reader")[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(
        "You do not have permission to access this resource"
      );
    }

    next();
  };
}
