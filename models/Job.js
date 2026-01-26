const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
      allowNull: true, // ⬅️ DŮLEŽITÉ – kvůli starým datům
    },

    reward: {
      type: DataTypes.STRING,
      allowNull: true, // orientační odměna
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
      type: DataTypes.INTEGER, // 1–24
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "open", // open | matched | done
    },
  });

  return Job;
};
