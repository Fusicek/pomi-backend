const { Model } = require("sequelize");

class User extends Model {
  static initModel(sequelize, DataTypes) {
    User.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM("customer", "provider"),
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING,
        },
        experience: {
          type: DataTypes.TEXT,
        },
        skills: {
          type: DataTypes.TEXT,
        },
      },
      {
        sequelize,
        modelName: "User",
      }
    );
  }
}

module.exports = User;


