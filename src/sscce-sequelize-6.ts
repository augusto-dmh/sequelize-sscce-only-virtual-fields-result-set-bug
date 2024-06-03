import { DataTypes, Model } from "sequelize";
import { createSequelize6Instance } from "../dev/create-sequelize-instance";
import { expect } from "chai";

export const testingOnDialects = new Set([
  "mssql",
  "sqlite",
  "mysql",
  "mariadb",
  "postgres",
  "postgres-native",
]);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Avatar extends Model {}
  Avatar.init(
    {
      name: DataTypes.STRING,
      filename: DataTypes.STRING,
      url: {
        type: DataTypes.VIRTUAL,
        get() {
          return `/images/${this.getDataValue("filename")}`;
        },
      },
      otherVirtualField: {
        type: DataTypes.VIRTUAL,
        get() {
          return "Other virtual field";
        },
      },
    },
    {
      sequelize,
      modelName: "Avatar",
    }
  );

  class User extends Model {}
  User.init(
    {
      nickname: DataTypes.STRING,
      selectedAvatarId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.belongsTo(Avatar, {
    as: "selectedAvatar",
    foreignKey: "selectedAvatarId",
  });

  await sequelize.sync({ force: true });

  const avatar = await Avatar.create({
    name: "Avatar1",
    filename: "avatar1.png",
  });
  const user = await User.create({
    nickname: "User1",
    selectedAvatarId: (avatar as any).id,
  });

  const users = await User.findAll({
    include: [
      {
        model: Avatar,
        as: "selectedAvatar",
        attributes: ["url", "otherVirtualField"],
      },
    ],
  });

  console.log(users);
}
