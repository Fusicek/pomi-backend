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

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    reward: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    timeFrom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    timeTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "waiting",
    },

    waitingForHelper: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  return Job;
};

