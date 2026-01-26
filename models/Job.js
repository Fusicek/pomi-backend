const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Job", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
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

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mode: {
      type: DataTypes.STRING, // "cekat" | "vybrat"
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "nova",
    }
  });
};
