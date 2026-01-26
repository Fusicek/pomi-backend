const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  timeFrom: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.STRING, // wait / choose
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING, // open / connected / done
    defaultValue: "open",
  },
});

module.exports = Job;


module.exports = Job;

