const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const User = require("./User")(sequelize);

module.exports = {
  sequelize,
  User,
};
