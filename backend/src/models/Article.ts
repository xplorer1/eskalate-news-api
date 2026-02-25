import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ArticleAttributes {
  Id: string;
  Title: string;
  Content: string;
  Category: string;
  Status: "Draft" | "Published";
  AuthorId: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date | null;
}

interface ArticleCreationAttributes
  extends Optional<ArticleAttributes, "Id" | "Status" | "DeletedAt"> {}

class Article
  extends Model<ArticleAttributes, ArticleCreationAttributes>
  implements ArticleAttributes
{
  public Id!: string;
  public Title!: string;
  public Content!: string;
  public Category!: string;
  public Status!: "Draft" | "Published";
  public AuthorId!: string;

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
  public readonly DeletedAt!: Date | null;
}

Article.init(
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    Title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [1, 150],
          msg: "Title must be between 1 and 150 characters",
        },
      },
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [50, Infinity],
          msg: "Content must be at least 50 characters",
        },
      },
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Status: {
      type: DataTypes.ENUM("Draft", "Published"),
      allowNull: false,
      defaultValue: "Draft",
    },
    AuthorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "Id",
      },
    },
    DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "Articles",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    paranoid: true,
    deletedAt: "DeletedAt",
  }
);

export default Article;
