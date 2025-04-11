import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import EmployeeAttendance from "../../models/employeeAttendance";
import {Op} from "sequelize";


type getEmployeeAttendanceQuery = {
  start_date: Date;
  end_date: Date;
}

const getEmployeesAttendanceQuerySchema = Joi.object<getEmployeeAttendanceQuery>({
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
});

const getEmployeesAttendanceParamsSchema = Joi.object({
  employeeId: Joi.string().required(),
});

export default async function getEmployeeAttendance(req: Request, res: Response, next: NextFunction) {
  
  const error = joiValidator(getEmployeesAttendanceQuerySchema, "query", req, res);
  if (error) {
    next(error);
    return;
  }
  
  const paramsError = joiValidator(getEmployeesAttendanceParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }
  
  try {
    const { start_date, end_date } = req.query;
    const { employeeId } = req.params;
    const zeroTimedStartDate = new Date(new Date(start_date as string).setHours(0, 0, 0, 0));
    const zeroTimedEndDate = new Date(new Date(end_date as string).setHours(0, 0, 0, 0));
    
    const employeeAttendances = await EmployeeAttendance.findAll({
      where: {
        employeeId: employeeId,
        date: {
        [Op.between]: [zeroTimedStartDate, zeroTimedEndDate]
        } },
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