const sequelize = require("../config/db");

// pouze načteme modely, NIC NEVOLÁME
require("./User");
require("./Job");

module.exports = {
  sequelize,
};
