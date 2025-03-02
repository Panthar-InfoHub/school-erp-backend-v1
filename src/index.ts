// src/index.ts

import dotenv from "dotenv";
dotenv.config();
import winston from "winston";
import expressWinston from "express-winston";
import "./lib/seq";
import Express from "express";
import cors from "cors"
import Joi from "joi";
import ResponseErr from "./error/responseErr";
import generateUUID from "./utils/uuidGenerator";
import employeeRouter from "./routers/employeeRouter";
import vehicleRouter from "./routers/vehicleRouter";
import studentRouter from "./routers/studentRouter";
import classRoomRouter from "./routers/classRoomRouter";



const PORT = Number(process.env.PORT) || 8080;



const app = Express()
app.use(cors({origin: "*"}))
app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

app.use((req, res, next) => {

    const requestId = req.headers["x-request-id"]
    if (requestId) {
        next()
        return;
    }

    // Assign RequestId
    req.headers["x-request-id"] = generateUUID()
    next()
    return;
})

app.use(expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, message }) => {
            return `[${timestamp}] ${message}`;
        })
    ),
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: true,
}));


app.use("/v1/employee", employeeRouter)
app.use("/v1/vehicle", vehicleRouter)
app.use("/v1/student", studentRouter)
app.use("/v1/classroom", classRoomRouter)

app.get("/", (req: Express.Request, res: Express.Response) => {
    res.send("Server is live!");
    return
})


app.use((err:any, req:Express.Request, res:Express.Response, next:Express.NextFunction) => {

    if (err instanceof Joi.ValidationError) {
        res.status(400).json({
            error: err.message,
            details: err.details
        })
        return
    }

    if (err instanceof ResponseErr) {
        res.status(err.responseCode).json({
            error: err.message,
            details: err.details
        })
        return
    }

    if (err instanceof Error) {
        res.status(500).json({
            error: err.message,
            name:  err.name,
            details: process.env.NODE_ENV === "development" ? err.stack : undefined
        })
    }

    res.status(500).json(
        {
            error: "Internal Server Error",
            details: undefined
        }
    )
    next()
    return;

})

app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
})

