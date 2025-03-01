// getClassSections.ts
import Express, { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import ClassSection from "../../models/classSections";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";

const getSectionsParamsSchema = Joi.object({
  classroomId: Joi.string().pattern(/^classroom_/).required(),
});

export default async function getClassSections(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Validate request parameters
  const paramsError = joiValidator(getSectionsParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }

  const { classroomId } = req.params;

  try {
    // Check that the classroom exists
    const classroom = await ClassRoom.findByPk(classroomId);
    if (!classroom) {
      logger.error(`Classroom not found: ${classroomId}`);
      next(new ResponseErr(404, "Classroom Not Found", "The provided classroom id does not exist."));
      return;
    }

    // Fetch all sections of the classroom
    const sections = await ClassSection.findAll({
      where: { classRoomId: classroomId },
    });

    res.status(200).json({
      message: "Sections fetched successfully",
      sections,
    });
    return;
  } catch (err) {
    logger.error("Failed to fetch sections for the classroom", err);
    next(err);
    return;
  }
}