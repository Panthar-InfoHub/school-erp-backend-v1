import {startAttendanceScheduler} from "../cron/employeeAttendance";
import {Sequelize} from "sequelize-typescript";
import Employee from "../models/employee";
import Teacher from "../models/teacher";
import Admin from "../models/admin";
import Vehicle from "../models/vehicle";
import ClassRoom from "../models/classRoom";
import ClassSection from "../models/classSections";
import Student from "../models/student";
import StudentEnrollment from "../models/studentEnrollment";
import StudentMonthlyFee from "../models/studentMonthlyFeeModel";
import FeePayment from "../models/feePayment";
import ExamEntry from "../models/examEntry";
import EmployeeAttendance from "../models/employeeAttendance";

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
    throw new Error("DB_URL is not defined");
}

const sequelize = new Sequelize(DB_URL, {
    dialect: "postgres",
    models: [Employee, Teacher, Admin, Vehicle, ClassRoom,
        ClassSection, Student, StudentEnrollment, StudentMonthlyFee, FeePayment, ExamEntry, EmployeeAttendance],
    logging: false,
});

export default sequelize;

sequelize.sync({alter: true})
    .then(() => {
        console.log("DB Synced")
        startAttendanceScheduler()
    });
