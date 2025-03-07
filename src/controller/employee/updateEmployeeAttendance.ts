import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import {Request, Response, NextFunction} from "express";
import EmployeeAttendance from "../../models/employeeAttendance";
import logger from "../../lib/logger";
import ResponseErr from "../../error/responseErr";

type updateEmployeeAttendanceBody = {
	isPresent?: boolean,
	clockInTime?: Date,
	isHoliday?: boolean,
	isLeave?: boolean,
	isInvalid?: boolean
}

const updateEmployeeAttendanceSchema = Joi.object<updateEmployeeAttendanceBody>({
	isPresent: Joi.boolean().optional(),
	clockInTime: Joi.date().optional(),
	isHoliday: Joi.boolean().optional(),
	isLeave: Joi.boolean().optional(),
	isInvalid: Joi.boolean().optional(),
}).min(1).message("At least one field must be provided. Allowed fields: isPresent, clockInTime, isHoliday, isLeave, isInvalid.")

const updateEmployeeAttendanceParamsSchema = Joi.object({
	employeeId: Joi.string().required(),
	attendanceId: Joi.string().required(),
})

export default async function updateEmployeeAttendance(req: Request, res: Response, next: NextFunction) {
	const bodyErr = joiValidator(updateEmployeeAttendanceSchema, "body", req, res)
	if (bodyErr) {
		next(bodyErr)
		return
	}
	
	const paramsErr = joiValidator(updateEmployeeAttendanceParamsSchema, "params", req, res)
	if (paramsErr) {
		next(paramsErr)
		return
	}
	
	const {employeeId, attendanceId} = req.params
	const updateData: updateEmployeeAttendanceBody = req.body
	
	logger.debug("Updating attendance for employee with id:", employeeId, "attendance id:", attendanceId, "with data:", updateData)
	
	try {
		const attendance = await EmployeeAttendance.findOne({
			where: {
				employeeId,
				attendanceId
			}
		})
		
		if (!attendance) {
			next(new ResponseErr(404, "Attendance record not found",
				"No attendance record found with the provided IDs"))
			return
		}
		
		await attendance.update(updateData)
		
		logger.debug("Successfully updated attendance for employee with id:", employeeId, "attendance id:", attendanceId)
		
		res.status(200).json({
			message: "Attendance updated successfully",
			attendanceData: attendance
		})
		return
		
	} catch (e) {
		logger.error("Error updating attendance for employee with id:", employeeId, "attendance id:", attendanceId)
		next(e)
		return
	}
}