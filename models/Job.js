import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { JobStatus } from "../constants/jobStatus.js";

const Job = sequelize.define("Job", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  mode: {
    type: DataTypes.ENUM("wait", "choose"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(JobStatus)),
    allowNull: false,
    defaultValue: JobStatus.NEW_WAITING,
  },
  agreedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  requesterEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  helperEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Job;
