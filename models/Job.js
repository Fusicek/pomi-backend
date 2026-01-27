const { DataTypes, Model } = require("sequelize");

class Job extends Model {
  static initModel(sequelize) {
    Job.init(
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },

        timeFrom: {
          type: DataTypes.INTEGER, // hodiny 1–24
          allowNull: false,
        },

        timeTo: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        location: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        estimatedReward: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        status: {
          type: DataTypes.ENUM("cekajici", "domluveno", "hotovo"),
          defaultValue: "cekajici",
        },
      },
      {
        sequelize,
        modelName: "Job",
      }
    );
  }
}

module.exports = Job;

