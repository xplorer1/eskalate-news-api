import { fn, col, literal } from "sequelize";
import { Article, DailyAnalytics } from "../../models";

export class AnalyticsService {
  async getAuthorDashboard(authorId: string, page: number, size: number) {
    const offset = (page - 1) * size;

    const { rows, count } = await Article.findAndCountAll({
      where: { AuthorId: authorId },
      attributes: [
        "Id",
        "Title",
        "CreatedAt",
        [
          fn("COALESCE", fn("SUM", col("DailyAnalytics.ViewCount")), 0),
          "TotalViews",
        ],
      ],
      include: [
        {
          model: DailyAnalytics,
          as: "DailyAnalytics",
          attributes: [],
        },
      ],
      group: ["Article.Id"],
      order: [["CreatedAt", "DESC"]],
      limit: size,
      offset,
      subQuery: false,
    });

    // Sequelize returns count as an array when using GROUP BY
    const total = Array.isArray(count) ? count.length : count;

    return { articles: rows, total };
  }
}
