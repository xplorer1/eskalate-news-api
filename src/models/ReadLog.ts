import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ReadLogAttributes {
  Id: string;
  ArticleId: string;
  ReaderId: string | null;
  ReadAt: Date;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface ReadLogCreationAttributes
  extends Optional<ReadLogAttributes, "Id" | "ReaderId" | "ReadAt"> {}

class ReadLog
  extends Model<ReadLogAttributes, ReadLogCreationAttributes>
  implements ReadLogAttributes
{
  public Id!: string;
  public ArticleId!: string;
  public ReaderId!: string | null;
  public ReadAt!: Date;

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

ReadLog.init(
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
    ReaderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "Id",
      },
    },
    ReadAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "ReadLogs",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default ReadLog;
