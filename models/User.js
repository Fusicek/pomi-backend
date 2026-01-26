const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "helper",
  },

  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  experience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = User;

