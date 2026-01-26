const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  timeFrom: {
    type: DataTypes.INTEGER, // 1–24
    allowNull: false,
  },

  timeTo: {
    type: DataTypes.INTEGER, // 1–24
    allowNull: false,
  },

  rewardEstimate: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  waitingForHelper: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  providerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Job;


