import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";
import ClassSection from "../../models/classSections";
import StudentEnrollment from "../../models/studentEnrollment";

// Schema for validating the params (classroomId)
const deleteClassroomParamsSchema = Joi.object({
    classroomId: Joi.string()
        .pattern(/^classroom_/) // ensures the classroom id follows the expected pattern
        .required(),
});

const deleteClassroomBodySchema = Joi.object({
    force: Joi.boolean().optional(),
})

export default async function deleteClassroom(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    logger.info("Starting classroom deletion process.");

    // Validate params
    const paramsError = joiValidator(deleteClassroomParamsSchema, "params", req, res);
    if (paramsError) {
        next(paramsError);
        return
    }

    const bodyErr = joiValidator(deleteClassroomBodySchema, "body", req, res);
    if (bodyErr) {
        next(bodyErr);
        return
    }

    const { classroomId } = req.params;
    const transaction = await sequelize.transaction();

    try {
        // Retrieve the classroom record by primary key including its sections
        const classroom = await ClassRoom.findByPk(classroomId, {
            include: [
                {
                    model: ClassSection,
                    include: [
                        StudentEnrollment
                    ],
                }
            ],
            transaction,
        });

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

        // If the classroom has associated sections, delete each one individually
        if (classroom.classSections && classroom.classSections.length > 0) {
            for (const section of classroom.classSections) {
                logger.info(`Deleting classroom section with id: ${section.id}`);
                if (section.studentEnrollments && section.studentEnrollments.length > 0) {
                    if (req.body.force) {
                        logger.warn(`Force deletion of classroom section with id: ${section.id}`);
                        await section.destroy({ transaction });
                        continue;
                    }

                    // If force is not true
                    await transaction.rollback();
                    logger.error(`Classroom section has associated student enrollments: ${section.id}`);
                    return next(
                        new ResponseErr(
                            409,
                            `Classroom section has enrolled students. Either Deletion not permitted.`,
                            "Cannot delete classroom section with associated student enrollments."
                        )
                    );
                }
                await section.destroy({ transaction });
            }
        }

        // Delete the classroom record
        await classroom.destroy({ transaction });
        await transaction.commit();

        logger.info(`Classroom and its sections deleted successfully: ${classroomId}`);
        res.status(200).json({
            message: "Classroom and its sections deleted successfully.",
        });
    } catch (error) {
        await transaction.rollback();
        logger.error(error);
        next(error);
    }
}