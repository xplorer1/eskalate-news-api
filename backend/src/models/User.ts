import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  Id: string;
  Name: string;
  Email: string;
  Password: string;
  Role: "author" | "reader";
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "Id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public Id!: string;
  public Name!: string;
  public Email!: string;
  public Password!: string;
  public Role!: "author" | "reader";

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

User.init(
  {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[A-Za-z\s]+$/,
          msg: "Name must contain only alphabets and spaces",
        },
      },
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Role: {
      type: DataTypes.ENUM("author", "reader"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default User;
