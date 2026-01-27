const Job = sequelize.define("Job", {
  title: DataTypes.STRING,

  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "ostatni", // 🔥 KLÍČOVÉ
  },

  description: DataTypes.TEXT,
  reward: DataTypes.STRING,
  date: DataTypes.STRING,
  timeFrom: DataTypes.STRING,
  timeTo: DataTypes.STRING,
  location: DataTypes.STRING,
  status: DataTypes.STRING,
});
