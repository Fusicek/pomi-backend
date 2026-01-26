const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Job", {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    timeFrom: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timeTo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reward: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "cekani"
    }
  });
};
