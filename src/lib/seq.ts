import {Sequelize} from "sequelize-typescript";

const sequelize = new Sequelize({
    dialect: "postgres",
    port: 5432,
    host: "localhost",
    username: "postgres",
    password: "postgres",
    database: "quick-erp",
    models: [__dirname + "../models"],
    logging: false,
});

sequelize.sync({alter: true})
    .then(() => console.log("DB Synced"));