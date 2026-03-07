const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatMessage = sequelize.define("ChatMessage",{

  message:{
    type:DataTypes.TEXT,
    allowNull:false
  },

  jobId:{
    type:DataTypes.INTEGER,
    allowNull:false
  },

  userId:{
    type:DataTypes.INTEGER,
    allowNull:false
  }

});

module.exports = ChatMessage;
