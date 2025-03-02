import {Sequelize} from "sequelize-typescript";
import Employee from "../models/employee";
import Teacher from "../models/teacher";
import Driver from "../models/driver";
import Admin from "../models/admin";
import Vehicle from "../models/vehicle";
import ClassRoom from "../models/classRoom";
import ClassSection from "../models/classSections";
import Student from "../models/student";
import StudentEnrollment from "../models/studentEnrollment";
import StudentMonthlyFee from "../models/studentMonthlyFeeModel";
import FeePayment from "../models/feePayment";

const sequelize = new Sequelize({
    dialect: "postgres",
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: [Employee, Teacher, Driver, Admin, Vehicle, ClassRoom,
        ClassSection, Student, StudentEnrollment, StudentMonthlyFee, FeePayment],
    logging: false,
});

export default sequelize;

sequelize.sync({alter: true})
    .then(() => console.log("DB Synced"));