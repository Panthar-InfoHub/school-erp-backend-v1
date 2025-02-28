import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import {v7} from "uuid"


type createEmployeeRequest = {
    name: string,
    address: string | undefined
    fatherName: string | undefined,
    fatherPhone: string | undefined,
    motherName: string | undefined,
    motherPhone: string | undefined,
    dateOfBirth: Date,
    workRole: string,
    salary: number,
    email: string,
    phone: string | undefined,
    isActive: boolean,
    isFired: boolean,
}

const createEmployeeSchema = Joi.object<createEmployeeRequest>({
    name: Joi.string().required(),
    address: Joi.string().allow('').optional(),
    fatherName: Joi.string().allow('').optional(),
    fatherPhone: Joi.string().allow('').optional(),
    motherName: Joi.string().allow('').optional(),
    motherPhone: Joi.string().allow('').optional(),
    dateOfBirth: Joi.date().required(),
    workRole: Joi.string().required(),
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

    try {
        const newEmployee = await Employee.create({id: `emp_${v7()}`,...body})

        res.status(201).json({
            message: "Employee Created Successfully",
            employee: newEmployee
        })

        return

    }
    catch (e) {
    if (e instanceof Error) {
        console.error(e)
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