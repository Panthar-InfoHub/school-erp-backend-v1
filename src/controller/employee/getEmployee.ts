// getEmployee.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import ResponseErr from "../../error/responseErr";
import Employee from "../../models/employee";

const getEmployeeParamsSchema = Joi.object({
	employeeId: Joi.string().required(),
});

export default async function getEmployeeData(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Validate query parameters
	const paramsErr = joiValidator(getEmployeeParamsSchema, "params", req, res);
	if (paramsErr) {
		next(paramsErr);
		return;
	}
	
	const {employeeId} = req.params
	
	
	try {
		logger.info(`Searching for Employee with id ${employeeId}`);
		
		
		const employee = await Employee.findByPk(employeeId, {
			attributes: {
				exclude: ["passwordHash", "profileImg"]
			}
		})
		
		if (!employee) {
			next(new ResponseErr(
				404,
				"No Employee Found",
				"Invalid Identifier was supplied with this action!"
			))
		}
		
		res.status(200).json({
			message: "Employee fetched successfully",
			employee: employee,
		});
		return;
	} catch (err) {
		logger.error("Error occurred while searching for Employee", err);
		next(err);
		return;
	}
}