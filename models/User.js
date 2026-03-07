const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {

  name: { type: DataTypes.STRING, allowNull:false },

  email: { type: DataTypes.STRING, unique:true, allowNull:false },

  password: { type: DataTypes.STRING, allowNull:false },

  role: {
    type: DataTypes.ENUM("zadavatel","zhotovitel"),
    allowNull:false
  },

  description: DataTypes.TEXT,

  profileCompleted:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  }

});

module.exports = User;
