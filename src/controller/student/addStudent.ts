import Express from 'express';
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Student from "../../models/student";
import generateUUID from "../../utils/uuidGenerator";
import sequelize from "../../lib/seq";
import {identityEntry} from "../../types";

type createStudentRequest = {
    name: string,
    address: string,
    dateOfBirth: Date,
    fatherName: string,
    motherName: string,
    fatherPhone: string | undefined ,
    motherPhone: string | undefined,
    ids: identityEntry[]
    isActive: boolean,
    UDISECode: string,
}

const createStudentRequestSchema = Joi.object<createStudentRequest>({
    name: Joi.string().required(),
    address: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    fatherName: Joi.string().required(),
    motherName: Joi.string().required(),
    fatherPhone: Joi.string().allow('').optional().regex(/^\+?[1-9]\d{1,14}$/),
    motherPhone: Joi.string().allow('').optional().regex(/^\+?[1-9]\d{1,14}$/),
    ids: Joi.array().items(Joi.object({
        idDocName: Joi.string().required(),
        idDocValue: Joi.string().required()
    })).required(),
    isActive: Joi.boolean().required(),
    UDISECode: Joi.string().allow('').required(),
})

export default async function createStudent(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(createStudentRequestSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const body : createStudentRequest = req.body;
    const transaction = await sequelize.transaction()

    try {

        const newStudent = await Student.create({
            id: `stu_${generateUUID()}`,
            searchName: body.name.toLowerCase(),
            ...body,
        }, {transaction})

        await transaction.commit()

        res.status(200).json({
            message: "Student created successfully",
            studentData: newStudent,
        })


    }
    catch (e) {
        await transaction.rollback();
        next(e)
        return
    }

}
