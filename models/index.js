const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
});

// ===== MODELS =====
const User = require("./User")(sequelize, DataTypes);
const Job = require("./Job")(sequelize, DataTypes);
const Chat = require("./Chat")(sequelize, DataTypes);
const Message = require("./Message")(sequelize, DataTypes);
const Review = require("./Review")(sequelize, DataTypes);

// ===== ASSOCIATIONS =====
User.hasMany(Job, { foreignKey: "customerId" });
Job.belongsTo(User, { foreignKey: "customerId", as: "customer" });

User.hasMany(Job, { foreignKey: "providerId" });
Job.belongsTo(User, { foreignKey: "providerId", as: "provider" });

Job.hasMany(Chat);
Chat.belongsTo(Job);

Chat.hasMany(Message);
Message.belongsTo(Chat);

User.hasMany(Review);
Review.belongsTo(User);

// ===== EXPORT =====
module.exports = {
  sequelize,
  User,
  Job,
  Chat,
  Message,
  Review,
};
