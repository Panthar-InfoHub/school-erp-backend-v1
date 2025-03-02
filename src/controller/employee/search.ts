import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import {Op} from "sequelize"
import logger from "../../lib/logger";

type searchEmployeeReqQuery = {
    q: string | undefined
    page: number
    limit: number,
    ascending: boolean | undefined,
}

const searchEmployeeReqSchema = Joi.object<searchEmployeeReqQuery>({
    q: Joi.string().allow("").optional(),
    page: Joi.number().required().min(1).default(1),
    limit: Joi.number().required().min(1).default(10),
    ascending: Joi.boolean().optional(),
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
    const ascending = req.query.ascending === "true"

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
            order: [
                ["name", ascending ? "ASC" : "DESC"],
                ["id", ascending ? "ASC" : "DESC"],
                ["email", ascending ? "ASC" : "DESC"],
                ["address", ascending ? "ASC" : "DESC"],
            ],
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