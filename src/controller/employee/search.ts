import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import {Op} from "sequelize"
import logger from "../../lib/logger";

type searchEmployeeReqQuery = {
    q: string
    page: number
    limit: number
}

const searchEmployeeReqSchema = Joi.object<searchEmployeeReqQuery>({
    q: Joi.string().required(),
    page: Joi.number().required().min(1).default(1),
    limit: Joi.number().required().min(1).default(10)
})

export default async function searchEmployee(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(searchEmployeeReqSchema, "query", req, res)
    if (error) {
        next(error)
        return
    }

    const q = String(req.query.q)
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    try {

        const foundEmployees = await Employee.findAll({
            where: {
                [Op.or]: [
                    {name: {[Op.like]: `%${q}%`}},
                    {id: {[Op.like]: `%${q}%`}},
                    {email: {[Op.like]: `%${q}%`}},
                    {address: {[Op.like]: `%${q}%`}}
                ]
            },
            attributes: {
                exclude: ['passwordHash'],
            },
            limit: limit,
            offset: (page - 1) * limit,
        })

        logger.info(`Found ${foundEmployees.length} employees matching query ${q}`)

        res.json({
            message: `${foundEmployees.length} Employees found`,
            employees: foundEmployees,
        })

    }
    catch (e) {
        logger.error(e)
        next(e)
    }



}