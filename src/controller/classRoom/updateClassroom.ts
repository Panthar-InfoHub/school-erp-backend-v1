import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Schema for validating the params (classroomId)
const updateClassroomParamsSchema = Joi.object({
    classroomId: Joi.string()
        .pattern(/^classroom_/) // ensures the classroom id follows the expected pattern
        .required(),
});

// Schema for validating the request body
const updateClassroomBodySchema = Joi.object({
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
})
    .or("name", "isActive") // at least one field must be provided
    .messages({
        "object.missing": "At least one field (name or isActive) must be provided.",
    });

export default async function updateClassroom(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    logger.info("Starting classroom update process.");

    // Validate params
    const paramsErr = joiValidator(updateClassroomParamsSchema, "params", req, res);
    if (paramsErr) {
        next(paramsErr);
        return
    }

    // Validate body
    const bodyErr = joiValidator(updateClassroomBodySchema, "body", req, res);
    if (bodyErr) {
        next(bodyErr);
        return
    }

    const { classroomId } = req.params;
    const { name, isActive } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Retrieve the classroom record by primary key
        const classroom = await ClassRoom.findByPk(classroomId, { transaction });
        if (!classroom) {
            await transaction.rollback();
            logger.error(`Classroom not found: ${classroomId}`);
            return next(
                new ResponseErr(
                    404,
                    "Classroom Not Found",
                    "The provided classroom id does not exist."
                )
            );
        }

        // Update the classroom fields if provided
        if (name) {
            logger.info(
                `Updating classroom name from ${classroom.name} to ${name.toUpperCase()}.`
            );
            classroom.name = name.toUpperCase();
        }

        if (typeof isActive === "boolean") {
            logger.info(
                `Updating classroom isActive from ${classroom.isActive} to ${isActive}.`
            );
            classroom.isActive = isActive;
        }

        await classroom.save({ transaction });
        await transaction.commit();

        logger.info(`Classroom updated successfully: ${classroomId}`);
        res.status(200).json({
            message: "Classroom updated successfully",
            classRoomData: classroom,
        });
    } catch (error) {
        await transaction.rollback();
        logger.error(error);
        if (error instanceof Error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                next(new ResponseErr(409, "The classroom name provided already exists.",
                    "The classroom name provided already exists."))
                return
            }
        }
        next(error);
    }
}