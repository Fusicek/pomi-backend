const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const User = require("./User")(sequelize);
const Job = require("./Job")(sequelize);

// vztah
User.hasMany(Job);
Job.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Job,
};
