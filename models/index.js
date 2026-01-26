const sequelize = require("../db");

const User = require("./User")(sequelize);
const Job = require("./Job")(sequelize);

User.hasMany(Job);
Job.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Job
};
