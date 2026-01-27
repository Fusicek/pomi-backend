module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Job", {
    title: {
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
      type: DataTypes.STRING,
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
};
