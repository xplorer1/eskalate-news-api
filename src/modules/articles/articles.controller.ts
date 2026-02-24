import { Response, NextFunction } from "express";
import { ArticlesService } from "./articles.service";
import { AuthRequest } from "../../shared/types";
import { sendSuccess, sendPaginated } from "../../shared/response";

const articlesService = new ArticlesService();

export class ArticlesController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const article = await articlesService.create(req.user!.sub, req.body);
      return sendSuccess(res, "Article created successfully", article, 201);
    } catch (error) {
      next(error);
    }
  }

  async listMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const size = Math.max(1, Math.min(100, parseInt(req.query.size as string) || 10));
      const includeDeleted = req.query.includeDeleted === "true";

      const { articles, total } = await articlesService.listMine(
        req.user!.sub,
        page,
        size,
        includeDeleted
      );

      return sendPaginated(res, "Articles retrieved successfully", articles, page, size, total);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const articleId = req.params.id as string;
      const article = await articlesService.update(
        articleId,
        req.user!.sub,
        req.body
      );
      return sendSuccess(res, "Article updated successfully", article);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const articleId = req.params.id as string;
      await articlesService.softDelete(articleId, req.user!.sub);
      return sendSuccess(res, "Article deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
