import winston from "winston";


const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({filename: 'exceptions.log'})
    ],
    rejectionHandlers: [
        new winston.transports.File({filename: 'rejections.log'})
    ]
});


export default logger;