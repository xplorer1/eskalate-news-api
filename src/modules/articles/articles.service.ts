import { Article, User } from "../../models";
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
}
