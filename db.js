const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("❌ DATABASE_URL není nastavená");
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

module.exports = sequelize;
