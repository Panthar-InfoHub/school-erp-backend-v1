import { Request, Response, NextFunction } from "express";
import Employee from "../../models/employee";
import EmployeeAttendance from "../../models/employeeAttendance";
import generateUUID from "../../utils/uuidGenerator";
import logger from "../../lib/logger";

export default async function generateDailyAttendanceEntries(req: Request, res: Response, next: NextFunction) {
  const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  logger.debug('Generating daily attendance entries manually at:', istDate);
  
  const currentDate = new Date(istDate);
  currentDate.setHours(0, 0, 0, 0);
  const isSunday = currentDate.getDay() === 0;
  
  try {
    const employees = await Employee.findAll({
      where: {
        isActive: true,
        isFired: false
      }
    });
    
    logger.debug(`Found ${employees.length} active employees.`);
    
    for (const employee of employees) {
      const existingAttendance = await EmployeeAttendance.findOne({
        where: {
          employeeId: employee.id,
          date: currentDate
        }
      });
      
      if (!existingAttendance) {
        await EmployeeAttendance.create({
          attendanceId: `att_${generateUUID()}`,
          employeeId: employee.id,
          date: currentDate,
          isPresent: false,
          isHoliday: isSunday,
          isLeave: false,
          isInvalid: false,
          clockInTime: null
        });
        logger.debug(`Created attendance entry for employeeId: ${employee.id} on date: ${currentDate}`);
      } else {
        logger.debug(`Attendance entry already exists for employeeId: ${employee.id}`);
      }
    }
    
    res.status(200).json({});
  } catch (error) {
    logger.error('Error generating daily attendance entries:', error);
    next(error);
  }
}

