import User from "./User";
import Article from "./Article";
import ReadLog from "./ReadLog";
import DailyAnalytics from "./DailyAnalytics";

// User -> Articles (one-to-many)
User.hasMany(Article, { foreignKey: "AuthorId", as: "Articles" });
Article.belongsTo(User, { foreignKey: "AuthorId", as: "Author" });

// Article -> ReadLogs (one-to-many)
Article.hasMany(ReadLog, { foreignKey: "ArticleId", as: "ReadLogs" });
ReadLog.belongsTo(Article, { foreignKey: "ArticleId", as: "Article" });

// User -> ReadLogs (one-to-many, optional reader)
User.hasMany(ReadLog, { foreignKey: "ReaderId", as: "ReadLogs" });
ReadLog.belongsTo(User, { foreignKey: "ReaderId", as: "Reader" });

// Article -> DailyAnalytics (one-to-many)
Article.hasMany(DailyAnalytics, {
  foreignKey: "ArticleId",
  as: "DailyAnalytics",
});
DailyAnalytics.belongsTo(Article, { foreignKey: "ArticleId", as: "Article" });

export { User, Article, ReadLog, DailyAnalytics };
