const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./User");
const Job = require("./Job");
const Chat = require("./Chat");
const Message = require("./Message");
const Review = require("./Review");

/* ===== INIT MODELS ===== */
User.initModel(sequelize, DataTypes);
Job.initModel(sequelize, DataTypes);
Chat.initModel(sequelize, DataTypes);
Message.initModel(sequelize, DataTypes);
Review.initModel(sequelize, DataTypes);

/* ===== ASSOCIATIONS ===== */
User.hasMany(Job, { foreignKey: "customerId" });
User.hasMany(Job, { foreignKey: "providerId" });

Job.belongsTo(User, { as: "customer", foreignKey: "customerId" });
Job.belongsTo(User, { as: "provider", foreignKey: "providerId" });

Chat.belongsTo(Job);
Job.hasOne(Chat);

Chat.hasMany(Message);
Message.belongsTo(Chat);

User.hasMany(Review);
Review.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Job,
  Chat,
  Message,
  Review,
};
