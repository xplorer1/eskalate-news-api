import { Response, NextFunction } from "express";
import { AnalyticsService } from "./analytics.service";
import { AuthRequest } from "../../shared/types";
import { sendPaginated } from "../../shared/response";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const size = Math.max(
        1,
        Math.min(100, parseInt(req.query.size as string) || 10)
      );

      const { articles, total } = await analyticsService.getAuthorDashboard(
        req.user!.sub,
        page,
        size
      );

      return sendPaginated(
        res,
        "Dashboard retrieved successfully",
        articles,
        page,
        size,
        total
      );
    } catch (error) {
      next(error);
    }
  }
}
