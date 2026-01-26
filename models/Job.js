const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  timeFrom: {
    type: DataTypes.INTEGER, // 1–24
    allowNull: false,
  },

  timeTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  reward: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  mode: {
    type: DataTypes.STRING, // wait | choose
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "open",
  },
});

module.exports = Job;


