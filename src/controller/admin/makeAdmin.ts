import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Admin from "../../models/admin";
import ResponseErr from "../../error/responseErr";
import Employee from "../../models/employee";
import logger from "../../lib/logger";

type makeAdminRequest = {
    targetEmployeeId: string
}

const makeAdminRequestSchema = Joi.object<makeAdminRequest>({
    targetEmployeeId: Joi.string().required(),
})


export default async function makeAdmin(req: Request, res: Response, next: NextFunction) {

    const error = joiValidator(makeAdminRequestSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const {employeeId} = req.params
    const { targetEmployeeId } : makeAdminRequest = req.body;

    if (targetEmployeeId === employeeId) {
        next(new ResponseErr(400, "Invalid Request", "Cannot make an employee admin of themselves."))
        return
    }

    try {

        const adminEmployee = await Admin.findByPk(employeeId);
        if (!adminEmployee) {
            next(new ResponseErr(404, "Admin Not Found", "The admin id provided does not exist."))
            return
        }

        const targetEmployee = await Employee.findByPk(targetEmployeeId, {
            include: [Admin]
        });
        if (!targetEmployee) {
            next(new ResponseErr(404, "Employee Not Found", "The employee id provided does not exist."))
            return
        }

        if (targetEmployee.admin) {
            next(new ResponseErr(409, "Employee Already Admin", "The provided employee is already an admin."))
            return
        }

        // Make admin
        await Admin.create({
            id: targetEmployeeId,
        })

        res.status(201).json({
            message: "Employee made admin successfully",
        })

    }
    catch (e) {
        logger.error("Failed to make employee admin", e)
        next(e)
    }





}