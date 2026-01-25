import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Rating = sequelize.define("Rating", {
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fromUserEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toUserEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER, // 1–5
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
  },
  role: {
    type: DataTypes.ENUM("requester_to_helper", "helper_to_requester"),
    allowNull: false,
  },
});

export default Rating;
