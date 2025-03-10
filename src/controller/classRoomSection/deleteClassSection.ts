// deleteSection.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import ClassSection from "../../models/classSections";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";
import StudentEnrollment from "../../models/studentEnrollment";

const deleteSectionParamsSchema = Joi.object({
    classroomId: Joi.string().pattern(/^classroom_/).required(),
    classroomSectionId: Joi.string().pattern(/^section_/).required(),
});

type deleteSectionQuery = {
    force: boolean
}

const deleteSectionQuerySchema = Joi.object<deleteSectionQuery>({
    force: Joi.boolean().optional(),
})

export default async function deleteSection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Validate the request parameters
    const paramsError = joiValidator(deleteSectionParamsSchema, "params", req, res);
    if (paramsError) {
        next(paramsError);
        return;
    }
    const bodyErr = joiValidator(deleteSectionQuerySchema, "query", req, res);
    if (bodyErr) {
        next(bodyErr);
        return;
    }

    const { classroomId, classroomSectionId } = req.params;
    const { force }  = req.query;

    try {
        // Ensure the classroom exists
        const classroom = await ClassRoom.findByPk(classroomId);
        if (!classroom) {
            logger.error(`Classroom not found: ${classroomId}`);
            next(
                new ResponseErr(
                    404,
                    "Classroom Not Found",
                    "The provided classroom id does not exist."
                )
            );
            return
        }

        // Find the section to delete and include its enrollments
        const section = await ClassSection.findByPk(classroomSectionId, {
            include: [StudentEnrollment],
        });
        if (!section) {
            logger.error(`Section not found: ${classroomSectionId}`);
            next(
                new ResponseErr(
                    404,
                    "Section Not Found",
                    "The provided section id does not exist."
                )
            );
            return
        }

        // Ensure the section belongs to the provided classroom
        if (section.classRoomId !== classroomId) {
            logger.error(`Section ${classroomSectionId} does not belong to classroom ${classroomId}`);
            next(
                new ResponseErr(
                    400,
                    "Mismatch Error",
                    "The section does not belong to the specified classroom."
                )
            );
            return
        }

        // Check if the section has any enrollment entries
        if (section.studentEnrollments && section.studentEnrollments.length > 0 && !Boolean(force)) {
            logger.error(`Section ${classroomSectionId} has enrollments and cannot be deleted.`);
            next(
                new ResponseErr(
                    400,
                    "Section Deletion Error",
                    "Cannot delete section as there are enrollment entries associated with it."
                )
            );
            return
        }

        // Delete the section
        await section.destroy();

        logger.info(`Section deleted successfully: ${section.id}. force: ${force}`);
        res.status(200).json({
            message: "Section deleted successfully",
        });
        return
    } catch (err) {
        logger.error("Failed to delete classroom section", err);
        next(err);
    }
}