const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./User")(sequelize, DataTypes);
const Job = require("./Job")(sequelize, DataTypes);

module.exports = {
  sequelize,
  Sequelize,
  User,
  Job,
};
