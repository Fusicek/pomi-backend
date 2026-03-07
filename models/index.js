const User = require("./User");
const Job = require("./Job");
const ChatMessage = require("./ChatMessage");

/* RELATIONS */

Job.hasMany(ChatMessage,{
  foreignKey:"jobId",
  as:"messages"
});

ChatMessage.belongsTo(Job,{
  foreignKey:"jobId"
});

User.hasMany(ChatMessage,{
  foreignKey:"userId"
});

ChatMessage.belongsTo(User,{
  foreignKey:"userId",
  as:"sender"
});

module.exports = {
  User,
  Job,
  ChatMessage
};
