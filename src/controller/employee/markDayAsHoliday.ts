import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import EmployeeAttendance from "../../models/employeeAttendance";

// Validation schema for the request body
const setHolidaySchema = Joi.object({
  date: Joi.date().required(),
});

export default async function setDateAsHoliday(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate the request body
    await setHolidaySchema.validateAsync(req.body);
    const { date } = req.body;

    // Normalize the provided date to midnight
    const zeroTimedDate = new Date(new Date(date as string).setHours(0, 0, 0, 0));

    // Update all attendance records for the given date by setting isHoliday to true
    const [affectedCount] = await EmployeeAttendance.update(
      { isHoliday: true },
      { where: { date: zeroTimedDate } }
    );

    res.status(200).json({
      message: "Holiday status updated successfully",
      affectedCount,
    });
  } catch (error) {
    console.error("Error occurred while setting holiday", error);
    next(error);
  }
}