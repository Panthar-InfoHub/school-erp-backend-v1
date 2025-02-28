import Express from "express";
import ClassRoom from "../../models/classRoom";
import logger from "../../lib/logger";
import ResponseErr from "../../error/responseErr";
import ClassSection from "../../models/classSections";

export default async function getClassrooms(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    logger.info("Fetching all classrooms with their sections");

    try {
        const classrooms = await ClassRoom.findAll({
            include: [ClassSection],
        });

        logger.info("Classrooms retrieved successfully");
        res.status(200).json({
            message: "Classrooms retrieved successfully",
            classRoomData: classrooms,
        });
    } catch (error) {
        logger.error(error);
        next(new ResponseErr(500, "Failed to retrieve classrooms", "An error occurred while fetching classrooms."));
    }
}