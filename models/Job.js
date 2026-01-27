module.exports = (sequelize, DataTypes) => {
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
      allowNull: false,
    },

    reward: {
      type: DataTypes.STRING, // orientační odměna
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
      type: DataTypes.INTEGER, // 1–24
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "cekani",
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return Job;
};

