import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";
import generateUUID from "../../utils/uuidGenerator";

type createClassroomRequest = {
    name: string,
    isActive: boolean,
    defaultFee: number,
}

const createClassroomRequestSchema = Joi.object<createClassroomRequest>({
    name: Joi.string().required(),
    isActive: Joi.boolean().required(),
    defaultFee: Joi.number().min(0).required(),
})

export default async function createClassroom(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(createClassroomRequestSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const body: createClassroomRequest = req.body;

    try {

        logger.debug("Creating new classroom")

        const newClassRoom = await ClassRoom.create({
            id : `classroom_${generateUUID()}`,
            name: body.name.toUpperCase(),
            isActive: body.isActive,
            defaultFee: body.defaultFee,
        })

        logger.info(`Classroom created successfully ${newClassRoom.id}`)

        res.status(200).json({
            message: "Classroom created successfully",
            classRoomData: newClassRoom,
        })


    }
    catch (err) {
        logger.error("Failed to create classroom", err)
        if (err instanceof Error) {
            if (err.name === "SequelizeUniqueConstraintError") {
                next(new ResponseErr(409, "The classroom name provided already exists.",
                    "The classroom name provided already exists."))
                return
            }
        }

        next(err)

    }



}