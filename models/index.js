const { Sequelize } = require("sequelize");
const Job = require("./Job");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

Job.initModel(sequelize);

module.exports = {
  sequelize,
  Job,
};
