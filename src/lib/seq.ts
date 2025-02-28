import {Sequelize} from "sequelize-typescript";
import Employee from "../models/employee";
import Teacher from "../models/teacher";
import Driver from "../models/driver";
import Admin from "../models/admin";
import Vehicle from "../models/vehicle";

const sequelize = new Sequelize({
    dialect: "postgres",
    port: 5432,
    host: "localhost",
    username: "postgres",
    password: "postgres",
    database: "quick-erp",
    models: [Employee, Teacher, Driver, Admin, Vehicle],
    logging: false,
});

sequelize.sync({alter: true})
    .then(() => console.log("DB Synced"));