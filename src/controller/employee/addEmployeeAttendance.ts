import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import {Request, Response, NextFunction} from "express";
import EmployeeAttendance from "../../models/employeeAttendance";
import generateUUID from "../../utils/uuidGenerator";
import logger from "../../lib/logger";
import ResponseErr from "../../error/responseErr";
import Employee from "../../models/employee";


type addEmployeeAttendanceBody = {
	date: Date
	isPresent?: boolean,
	clockInTime?: Date,
	isHoliday?: boolean,
	isLeave?: boolean,
	isInvalid?: boolean
}

const addEmployeeAttendanceSchema = Joi.object<addEmployeeAttendanceBody>({
	date: Joi.date().required(),
	isPresent: Joi.boolean().optional(),
	clockInTime: Joi.date().optional(),
	isHoliday: Joi.boolean().optional(),
	isLeave: Joi.boolean().optional(),
	isInvalid: Joi.boolean().optional(),
})

const addEmployeeAttendanceParamsSchema = Joi.object({
	employeeId: Joi.string().required(),
})


export default async function addEmployeeAttendance(req: Request, res: Response, next: NextFunction) {
	const bodyErr = joiValidator(addEmployeeAttendanceSchema,"body", req, res,)
	if (bodyErr) {
		next(bodyErr)
		return
	}
	
	const paramsErr = joiValidator(addEmployeeAttendanceParamsSchema, "params", req, res)
	if (paramsErr) {
		next(paramsErr)
		return
	}
	
	const {employeeId} = req.params
	const {date, isPresent, clockInTime, isHoliday, isInvalid, isLeave}: addEmployeeAttendanceBody = req.body
	
	logger.debug("Adding attendance for employee with id : ", employeeId, "with data" , req.body)
	
	try {
		
		const employee = await Employee.findByPk(employeeId)
		if (!employee) {
			next(new ResponseErr(404, "Employee Not Found", "The employee id provided does not exist."))
			return
		}
		
		if (!employee.isActive) {
			next(new ResponseErr(400, "Employee is disabled", "The employee is disabled. Please activate it first if needed."))
			return
		}
		
		if (employee.isFired) {
			next(new ResponseErr(409, "Employee is fired", "The employee is fired. Please un-fire them first if needed."))
			return
		}
		
		const newAttendance = await EmployeeAttendance.create({
			attendanceId : `att_${generateUUID()}`,
			date, isPresent, clockInTime, isHoliday, isInvalid, isLeave, employeeId,
		})
		
		logger.debug("Successfully added attendance for employee with id : ", employeeId, " on date : ", date)
		
		res.status(200).json({
			message: "Attendance added successfully",
			attendanceData: newAttendance,
		})
		return
		
		
	}
	catch (e) {
		logger.error("Error adding attendance for employee with id : ", employeeId, " on date : ", date)
		if (e instanceof Error) {
			if (e.name === "SequelizeUniqueConstraintError") {
				next(new ResponseErr(409, "Attendance already exists for this date.",
					"Attendance already exists for this date."))
				return
			}
			if (e.name === "SequelizeForeignKeyConstraintError") {
				next(new ResponseErr(409, "The employee id provided does not exist.",
					"The employee id provided does not exist."))
				return
			}
		}
		
		next(e)
		return
	}
	
	
}