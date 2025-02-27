// src/index.ts

import dotenv from "dotenv";
dotenv.config();
import winston from "winston";
import expressWinston from "express-winston";
import "./lib/seq";
import Express from "express";
import cors from "cors"

const PORT = Number(process.env.PORT) || 8080;


const app = Express()
app.use(cors({origin: "*"}))
app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))


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


app.get("/", (req: Express.Request, res: Express.Response) => {
    res.send("Server is live!");
    return
})


app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
})

