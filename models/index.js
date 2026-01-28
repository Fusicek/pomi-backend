const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
});

const Job = require("./Job")(sequelize);

module.exports = {
  sequelize,
  Job,
};
