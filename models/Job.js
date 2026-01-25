const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  type: {
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
    type: DataTypes.STRING,
    allowNull: false,
  },

  timeTo: {
    type: DataTypes.STRING,
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
    allowNull: false,
    defaultValue: "čeká na pomocníka",
  },
});

module.exports = Job;
