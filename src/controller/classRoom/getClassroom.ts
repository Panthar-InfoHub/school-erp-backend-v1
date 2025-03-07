import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";
import ClassSection from "../../models/classSections";

// Schema for validating the params (classroomId)
const getClassroomParamsSchema = Joi.object({
    classroomId: Joi.string()
        .pattern(/^classroom_/) // ensures the classroom id follows the expected pattern
        .required(),
});

export default async function getClassroom(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    logger.info("Starting get classroom process.");

    // Validate the request params
    const paramsError = joiValidator(getClassroomParamsSchema, "params", req, res);
    if (paramsError) {
        next(paramsError);
        return
    }

    const { classroomId } = req.params;

    try {
        const classroom = await ClassRoom.findByPk(classroomId, {include: [ClassSection]});
        if (!classroom) {
            logger.error(`Classroom not found: ${classroomId}`);
            return next(
                new ResponseErr(
                    404,
                    "Classroom Not Found",
                    "The provided classroom id does not exist."
                )
            );
        }

        logger.info(`Classroom retrieved successfully: ${classroomId}`);
        res.status(200).json({
            message: "Classroom retrieved successfully",
            classRoomData: classroom,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
}