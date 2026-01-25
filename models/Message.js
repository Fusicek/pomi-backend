import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Chat from "./Chat.js";

const Message = sequelize.define("Message", {
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Chat.hasMany(Message, { foreignKey: "chatId" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

export default Message;
