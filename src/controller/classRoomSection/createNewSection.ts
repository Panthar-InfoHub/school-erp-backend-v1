
import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import generateUUID from "../../utils/uuidGenerator";
import ClassSection from "../../models/classSections";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";

type CreateSectionRequest = {
    name: string;
    isActive: boolean;
    defaultFee: number;
    subjects: Array<{
        name: string;
        code: string;
        theoryExam: boolean;
        practicalExam: boolean;
    }>;
};

const createSectionRequestSchema = Joi.object<CreateSectionRequest>({
    name: Joi.string().required(),
    isActive: Joi.boolean().required(),
    defaultFee: Joi.number().min(0).required(),
    subjects: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                code: Joi.string().required(),
                theoryExam: Joi.boolean().required(),
                practicalExam: Joi.boolean().required(),
            })
        )
        .required(),
});

const createSectionParamsSchema = Joi.object({
    classroomId: Joi.string().pattern(/^classroom_/).required(),
})

export default async function createClassSection(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    // Validate the request body
    const error = joiValidator(createSectionRequestSchema, "body", req, res);
    if (error) {
        next(error);
        return
    }

    const paramsError = joiValidator(createSectionParamsSchema, "params", req, res);
    if (paramsError) {
        next(paramsError);
        return
    }

    const { classroomId } = req.params;
    const body : CreateSectionRequest = req.body;

    try {
        // Ensure the classroom exists before adding a section
        const classroom = await ClassRoom.findByPk(classroomId);
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

        logger.debug("Creating new classroom section");

        const newSection = await ClassSection.create({
            id: `section_${generateUUID()}`,
            classRoomId: classroomId,
            name: body.name,
            isActive: body.isActive,
            defaultFee: body.defaultFee,
            subjects: body.subjects,
        });

        logger.info(`Classroom section created successfully: ${newSection.id}`);

        res.status(200).json({
            message: "Classroom section created successfully",
            classSectionData: newSection,
        });
    } catch (err) {
        logger.error("Failed to create classroom section", err);
        if (err instanceof Error) {
            if (err.name === "SequelizeUniqueConstraintError") {
                return next(
                    new ResponseErr(
                        409,
                        "The classroom section name provided already exists.",
                        "The classroom section name provided already exists."
                    )
                );
            }
        }
        return next(err);
    }
}
