import Express from "express";
import Joi from "joi";
import logger from "../lib/logger";


type validationLocation = "body" | "query" | "params";

export default function joiValidator(schema: Joi.Schema, location: validationLocation,
                                     req: Express.Request, res: Express.Response) {

    logger.info(`Validating request with id - ${req.header("X-Request-Id")}`);


    const {error} = schema.validate(req[location], {abortEarly: false});

    if (error) {
        logger.info(`Validation failed for request with id - ${req.header("X-Request-Id")}: ${error.message}`);
        res.status(400).json(
            {
                error: error.message,
                details: error.details
            }
        )
        return error;
    }

    logger.debug(
        `Validation passed for request with id - ${req.header("X-Request-Id")}`)
    return;

}
