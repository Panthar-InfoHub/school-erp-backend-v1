import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import bcrypt from "bcrypt"
import logger from "../../lib/logger";
import generateUUID from "../../utils/uuidGenerator";
import sequelize from "../../lib/seq";
import Teacher from "../../models/teacher";
import Driver from "../../models/driver";
import {identityEntry} from "../../types";


type createEmployeeRequest = {
    name: string,
    password: string,
    address: string | undefined
    fatherName: string | undefined,
    fatherPhone: string | undefined,
    motherName: string | undefined,
    motherPhone: string | undefined,
    dateOfBirth: Date,
    workRole: string,
    salary: number,
    email: string,
    ids: identityEntry[],
    phone: string | undefined,
    isActive: boolean,
    isFired: boolean,
}

const createEmployeeSchema = Joi.object<createEmployeeRequest>({
    name: Joi.string().required(),
    password: Joi.string().required().min(8).regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{9,}$/),
    address: Joi.string().allow('').optional(),
    fatherName: Joi.string().allow('').optional(),
    fatherPhone: Joi.string().allow('').optional(),
    motherName: Joi.string().allow('').optional(),
    motherPhone: Joi.string().allow('').optional(),
    dateOfBirth: Joi.date().required(),
    workRole: Joi.string().required(),
    ids: Joi.array().items(Joi.object({
        idDocName: Joi.string().required(),
        idDocValue: Joi.string().required()
    })).required(),
    salary: Joi.number().min(0).default(0),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    isActive: Joi.boolean().default(true),
    isFired: Joi.boolean().default(false)
});


/*
* Validate Fields
* Create new Employee
* Save them
* Catch the UniqueConstraintErr
* */

export default async function createEmployee(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(createEmployeeSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const body : createEmployeeRequest = req.body;

    const transaction = await sequelize.transaction()

    try {

        const passwordHash = bcrypt.hashSync(body.password, 10)
        const newUserid = `emp_${generateUUID()}`

        logger.debug(`Generated password hash for Employee ${newUserid} is : ${passwordHash} (Employee yet to be saved)`)

        const newEmployee = await Employee.create({
            id: newUserid,
            passwordHash,
            ...body}
        , {transaction})

        // Based on their role.
        // Create Specific Entries.
        // ADMINS have their own routes!
        switch (body.workRole) {
            case "teacher":
                await Teacher.create({
                    id: newUserid,
                }, {transaction})
                break;
            case "driver":
                await Driver.create({
                    id: newUserid,
                }, {transaction})
                break;
            default:
                break;
        }

        await transaction.commit();

        logger.debug(`Employee created successfully ${newEmployee.id}`)

        res.status(201).json({
            message: "Employee Created Successfully",
            employee: newEmployee
        })

        return

    }
    catch (e) {

        await transaction.rollback();

        if (e instanceof Error) {
            logger.error(e)
            if (e.name === "SequelizeUniqueConstraintError") {
                res.status(409).json({
                    error: "Email already in use",
                    details: `${e.name}, ${e.message}`
                })
                return
            }
        }
    next(e)
}


}