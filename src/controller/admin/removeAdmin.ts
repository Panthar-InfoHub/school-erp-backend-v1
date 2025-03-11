import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Admin from "../../models/admin";
import ResponseErr from "../../error/responseErr";
import Employee from "../../models/employee";
import logger from "../../lib/logger";

type removeAdminReq = {
    targetEmployeeId: string
}

const removeAdminRequestSchema = Joi.object<removeAdminReq>({
    targetEmployeeId: Joi.string().required(),
})




export default async function removeAdmin(req: Request, res: Response, next: NextFunction) {

    const error = joiValidator(removeAdminRequestSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const {employeeId} = req.params
    const { targetEmployeeId } : removeAdminReq = req.body;

    if (targetEmployeeId === employeeId) {
        next(new ResponseErr(400, "Invalid Request", "Cannot assign admin permissions to themselves."))
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

        if (!targetEmployee.admin) {
            next(new ResponseErr(409, "Employee already stripped from admin permissions", "The provided employee is already not an admin."))
            return
        }

        // Make admin
        await Admin.destroy({where: {
            id: targetEmployeeId,
        }})

        res.status(201).json({
            message: "Employee removed as admin successfully",
        })

    }
    catch (e) {
        logger.error("Failed to remove employee as admin", e)
        next(e)
    }





}