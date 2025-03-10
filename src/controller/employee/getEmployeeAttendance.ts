import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import EmployeeAttendance from "../../models/employeeAttendance";

// Define a schema for fetching attendance by a single date
const getEmployeesAttendanceQuerySchema = Joi.object({
  date: Joi.date().required(),
});

export default async function getEmployeeAttendance(req: Request, res: Response, next: NextFunction) {
  
  const error = joiValidator(getEmployeesAttendanceQuerySchema, "query", req, res);
  if (error) {
    next(error);
    return;
  }
  
  try {
    const { date } = req.query;
    const zeroTimedDate = new Date(new Date(date as string).setHours(0, 0, 0, 0));
    
    const employeeAttendances = await EmployeeAttendance.findAll({
      where: { date: zeroTimedDate },
    });
    
    res.status(200).json({
      message: "Attendance fetched successfully",
      attendance: employeeAttendances,
    });
    
  } catch (e) {
    console.error("Error occurred while fetching attendance", e);
    next(e);
    return;
  }
}