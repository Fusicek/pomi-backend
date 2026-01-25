const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

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

  // ❗ ENUM PRYČ – obyčejný STRING
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

