import { Request, Response, NextFunction } from "express";
import Teacher from "../../models/teacher";
import StudentEnrollment from "../../models/studentEnrollment";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import FeePayment from "../../models/feePayment";
import Vehicle from "../../models/vehicle";
import EmployeeAttendance from "../../models/employeeAttendance";
import { Op } from "sequelize";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";

// Define a schema for the query params to ensure the current_date is provided.
const dashboardQuerySchema = Joi.object({
  current_date: Joi.date().required(),
});


export async function getDashboardStatus(req: Request, res: Response, next: NextFunction) {
  // Validate query parameters
  const error = joiValidator(dashboardQuerySchema, "query", req, res);
  if (error) {
	  next(error)
	  return
  }

  try {
    // Parse current_date from query and compute additional dates
    const currentDate = new Date(req.query.current_date as string);
    // if (isNaN(currentDate.getTime())) {
	// 	res.status(400).json({ message: "Invalid current_date provided" });
	// 	return
    // }

    // Calculate the last day of the current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0); // day 0 returns last day of previous month

    // Calculated date 30 days ago from currentDate
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    // 1. Count total teachers
    const totalTeachers = await Teacher.count();

    // 2. Count active student enrollments
    const activeStudentEnrollments = await StudentEnrollment.count({
      where: { isActive: true }
    });

    // 3. Determine teacher attendance today.
    // First, get all teacher records (teacher.id is the employee ID)
    const teachers = await Teacher.findAll({
      attributes: ["id"]
    });
    const teacherIds = teachers.map((teacher) => teacher.id);

    // Define today's boundaries. Assume EmployeeAttendance has an 'attendanceDate' column.
    const todayStart = new Date(currentDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(currentDate);
    todayEnd.setHours(23, 59, 59, 999);

    const attendanceRecords = await EmployeeAttendance.findAll({
      where: {
        employeeId: {
          [Op.in]: teacherIds
        },
        date: {
          [Op.between]: [todayStart, todayEnd]
        }
      },
      attributes: ["employeeId"]
    });
    // Create a set of teacherIds that have an attendance record today
    const presentTeacherIds = new Set(attendanceRecords.map((record) => record.employeeId));

    const teacherPresence = teacherIds.map((id) => ({
      teacherId: id,
      present: presentTeacherIds.has(id)
    }));

    // 4. Calculate total due payment.
    // Sum outstanding balances in StudentMonthlyFee records with dueDate <= last day of the current month and balance > 0.
    // 4. Calculate total due payment.
// Fetch StudentMonthlyFee entries with a balance greater than 0 and dueDate up to the lastDayOfMonth,
// including the related StudentEnrollment model.
const feeEntries = await StudentMonthlyFee.findAll({
  where: {
    balance: { [Op.gt]: 0 },
    dueDate: { [Op.lte]: lastDayOfMonth.toISOString().split("T")[0] }
  },
  include: [{
    model: StudentEnrollment,
    required: true // Ensures that the join is performed and an enrollment exists.
  }]
});

// Filter out entries whose associated student enrollment is inactive.
const activeFeeEntries = feeEntries.filter((entry) => {
  // Assuming the foreign key relationship sets the enrollment record on entry.studentEnrollment
  return entry.studentEnrollment?.isActive;
});



    // Sum all the balance values from the filtered entries.
const totalDuePayment = activeFeeEntries.reduce((sum, entry) => sum + entry.balance, 0);

    // 5. Total money paid in the last 30 days. Sum paidAmount from FeePayment (filter using paidOn date)
    const sumPaidResult = await FeePayment.sum("paidAmount", {
      where: {
        paidOn: {
          [Op.between]: [thirtyDaysAgo, currentDate]
        }
      }
    });
    const totalPaidLast30Days = parseFloat(sumPaidResult?.toString() || "0");

    // 6. Total vehicles.
    const totalVehicles = await Vehicle.count();

	res.status(200).json({
      message: "Dashboard info fetched successfully",
      totalTeachers,
      activeStudentEnrollments,
      teachersPresent: teacherPresence,
      totalDuePayment,
      totalPaidLast30Days,
      totalVehicles
    
	});
	
    return
  } catch (err) {
	  console.error(err)
    next(err);
  }
}

