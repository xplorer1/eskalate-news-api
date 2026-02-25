import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess } from "../../shared/response";

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.signup(req.body);
      return sendSuccess(res, "User registered successfully", user, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }
}
