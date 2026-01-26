const sequelize = require("../db");

const User = require("./User")(sequelize);
const Job = require("./Job")(sequelize);

module.exports = {
  sequelize,
  User,
  Job,
};
