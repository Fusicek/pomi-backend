const { DataTypes, Model } = require("sequelize");

class Job extends Model {
  static initModel(sequelize) {
    Job.init(
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        timeFrom: {
          type: DataTypes.INTEGER,
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
        reward: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            "cekani",
            "nabidka",
            "domluveno",
            "hotovo"
          ),
          defaultValue: "cekani",
        },
      },
      {
        sequelize,
        modelName: "Job",
        tableName: "Jobs",
      }
    );
  }
}

module.exports = Job;

