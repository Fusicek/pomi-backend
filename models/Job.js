const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Job = sequelize.define("Job", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reward: {
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
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "cekani",
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return Job;
};
