const sequelize = require("../db");
const User = require("./User");
const Job = require("./Job");

User.initModel(sequelize);
Job.initModel(sequelize);

// vztahy
User.hasMany(Job, { foreignKey: "userId" });
Job.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  Job,
};
