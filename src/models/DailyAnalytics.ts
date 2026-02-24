import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface DailyAnalyticsAttributes {
  Id: string;
  ArticleId: string;
  ViewCount: number;
  Date: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface DailyAnalyticsCreationAttributes
  extends Optional<DailyAnalyticsAttributes, "Id"> {}

class DailyAnalytics
  extends Model<DailyAnalyticsAttributes, DailyAnalyticsCreationAttributes>
  implements DailyAnalyticsAttributes
{
  public Id!: string;
  public ArticleId!: string;
  public ViewCount!: number;
  public Date!: string;

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

DailyAnalytics.init(
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ArticleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Articles",
        key: "Id",
      },
    },
    ViewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "DailyAnalytics",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    indexes: [
      {
        unique: true,
        fields: ["ArticleId", "Date"],
        name: "unique_article_date",
      },
    ],
  }
);

export default DailyAnalytics;
