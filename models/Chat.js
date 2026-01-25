import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Chat = sequelize.define("Chat", {
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userAEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userBEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Chat;
