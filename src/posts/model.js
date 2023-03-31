import sequelize from "../database.js";
import { DataTypes } from "sequelize";

const PostsModel = sequelize.define("posts", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
});

export default PostsModel;
