import { Op, WhereOptions } from "sequelize";
import { Article, User, ReadLog } from "../../models";
import { AppError } from "../../shared/errors";
import { CreateArticleInput, UpdateArticleInput } from "./articles.schema";

export class ArticlesService {
  async create(authorId: string, data: CreateArticleInput) {
    const article = await Article.create({
      ...data,
      AuthorId: authorId,
    });

    return article;
  }

  async listMine(
    authorId: string,
    page: number,
    size: number,
    includeDeleted: boolean = false
  ) {
    const offset = (page - 1) * size;

    const { rows, count } = await Article.findAndCountAll({
      where: { AuthorId: authorId },
      order: [["CreatedAt", "DESC"]],
      limit: size,
      offset,
      paranoid: !includeDeleted,
      include: [
        {
          model: User,
          as: "Author",
          attributes: ["Id", "Name"],
        },
      ],
    });

    return { articles: rows, total: count };
  }

  async update(articleId: string, authorId: string, data: UpdateArticleInput) {
    const article = await Article.findByPk(articleId);

    if (!article) {
      throw AppError.notFound("Article not found");
    }

    if (article.AuthorId !== authorId) {
      throw AppError.forbidden("You can only edit your own articles");
    }

    await article.update(data);

    return article;
  }

  async softDelete(articleId: string, authorId: string) {
    const article = await Article.findByPk(articleId);

    if (!article) {
      throw AppError.notFound("Article not found");
    }

    if (article.AuthorId !== authorId) {
      throw AppError.forbidden("You can only delete your own articles");
    }

    await article.destroy();
  }

  async publicFeed(
    page: number,
    size: number,
    filters: { category?: string; author?: string; q?: string }
  ) {
    const offset = (page - 1) * size;

    const where: WhereOptions = {
      Status: "Published",
    };

    if (filters.category) {
      where.Category = filters.category;
    }

    if (filters.q) {
      where[Op.or as any] = [
        { Title: { [Op.iLike]: `%${filters.q}%` } },
        { Content: { [Op.iLike]: `%${filters.q}%` } },
      ];
    }

    const includeAuthor: any = {
      model: User,
      as: "Author",
      attributes: ["Id", "Name"],
    };

    if (filters.author) {
      includeAuthor.where = {
        Name: { [Op.iLike]: `%${filters.author}%` },
      };
    }

    const { rows, count } = await Article.findAndCountAll({
      where,
      order: [["CreatedAt", "DESC"]],
      limit: size,
      offset,
      include: [includeAuthor],
    });

    return { articles: rows, total: count };
  }

  async findById(articleId: string) {
    // Use paranoid: false to also find soft-deleted articles,
    // so we can return the correct error message
    const article = await Article.findByPk(articleId, {
      paranoid: false,
      include: [
        {
          model: User,
          as: "Author",
          attributes: ["Id", "Name"],
        },
      ],
    });

    if (!article) {
      throw AppError.notFound("Article not found");
    }

    if (article.DeletedAt) {
      throw AppError.notFound("News article no longer available");
    }

    return article;
  }

  async logRead(articleId: string, readerId: string | null) {
    // Fire-and-forget: don't await, don't block the response
    ReadLog.create({
      ArticleId: articleId,
      ReaderId: readerId,
    }).catch((err) => {
      console.error("Failed to log read:", err);
    });
  }
}
