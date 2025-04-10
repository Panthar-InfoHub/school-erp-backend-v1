import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import EmployeeAttendance from "../../models/employeeAttendance";
import ResponseErr from "../../error/responseErr";
import Employee from "../../models/employee";


const getEmployeesAttendanceQuerySchema = Joi.object({
	date: Joi.date().required(),
})

export default async function getDailyAttendance(req: Request, res: Response, next: NextFunction) {
	
	const error = joiValidator(getEmployeesAttendanceQuerySchema, "query", req, res)
	if (error) {
		next(error)
		return
	}
	
	const { date } = req.query;
	
	const zeroTimedDate = new Date(new Date(date as string).setHours(0, 0, 0, 0));
	
	try {
		
		const attendanceData = await EmployeeAttendance.findAll(
		{
			where: {
				date: zeroTimedDate,
			},
			include: [
				{
					model: Employee,
					attributes: {
						exclude: ["id", "email","dateOfBirth", "phone", "passwordHash", "address", "fatherName", "motherName", "fatherPhone", "motherPhone",
							"ids", "salary", "createdAt", "updatedAt", "profileImg"]
					}
				}
			]
		}
	)
	
	res.status(200).json({
		message: "Attendance fetched successfully",
		attendanceData: attendanceData,
	});
	
	}
	catch (e) {
		
		console.error("Error occurred while fetching attendance", e)
		next(e)
		return
		
	}
	
}