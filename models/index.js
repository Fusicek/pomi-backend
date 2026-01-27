const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const User = require("./User")(sequelize, DataTypes);
const Job = require("./Job")(sequelize, DataTypes);

module.exports = {
  sequelize,
  User,
  Job,
};
