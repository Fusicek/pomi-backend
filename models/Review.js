const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  rating: DataTypes.INTEGER,
  comment: DataTypes.TEXT,
  userId: DataTypes.INTEGER,
  jobId: DataTypes.INTEGER
});

module.exports = { Review };
