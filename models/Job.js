const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.INTEGER,
  providerId: DataTypes.INTEGER,
  customerId: DataTypes.INTEGER
});

module.exports = { Job };
