import { Request, Response, NextFunction } from "express";
import Teacher from "../../models/teacher";
import StudentEnrollment from "../../models/studentEnrollment";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import FeePayment from "../../models/feePayment";
import Vehicle from "../../models/vehicle";
import Employee from "../../models/employee";
import Student from "../../models/student";
import Admin from "../../models/admin";
import { Op } from "sequelize";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";

// Define a schema for the query parameters; the current_date is required.
const dashboardQuerySchema = Joi.object({
  current_date: Joi.date().required(),
});

export async function getDashboardStatus(req: Request, res: Response, next: NextFunction) {
  // Validate the query parameters.
  const error = joiValidator(dashboardQuerySchema, "query", req, res);
  if (error) {
    next(error);
    return;
  }

  try {
    // Parse the current date from the query.
    const currentDate = new Date(req.query.current_date as string);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calculate the last day of the current month.
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Define a 30-day window (including the current day and the previous 29 days).
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 29);

    // For fee payment statistics, determine the start date of the current month.
    const currentMonthStart = new Date(year, month, 1);

    // Execute several count queries in parallel.
    const [
      totalActiveEmployees,
      totalTeachers,
      totalAdmins,
      totalRegisteredStudentsInDB,
      totalActiveStudents,
      enrollmentsCreatedInLastThirtyDays,
      activeStudentEnrollments,
      totalVehicles,
    ] = await Promise.all([
      Employee.count({ where: { isActive: true } }),
      Teacher.count(),
      Admin.count(),
      Student.count(),
      Student.count({ where: { isActive: true } }),
      StudentEnrollment.count({
        where: { createdAt: { [Op.between]: [thirtyDaysAgo, currentDate] } }
      }),
      StudentEnrollment.count({ where: { isActive: true } }),
      Vehicle.count()
    ]);

    // Calculate the total due payment based on all student monthly fees
    // with an outstanding balance and a due date within the current month.
    const feeEntries = await StudentMonthlyFee.findAll({
      where: {
        balance: { [Op.gt]: 0 },
        dueDate: { [Op.lte]: lastDayOfMonth }
      },
      raw: true
    });
    const totalDuePayment = feeEntries.reduce((sum, entry) => sum + Number(entry.balance), 0);

    // Sum the fee payments received during the current month.
    const feePaymentRecords = await FeePayment.findAll({
      where: {
        paidOn: { [Op.between]: [currentMonthStart, lastDayOfMonth] }
      },
      raw: true
    });
    const totalFeePaymentsReceived = feePaymentRecords.reduce((sum, record) => sum + Number(record.paidAmount), 0);

    // Compose the dashboard status response.
    const dashboardStatus = {
      totalActiveEmployees,
      totalTeachers,
      totalAdmins,
      totalRegisteredStudentsInDB,
      totalActiveStudents,
      enrollmentsCreatedInLastThirtyDays,
      activeStudentEnrollments,
      totalDuePayment,
      totalVehicles,
      totalFeePaymentsReceived,
    };

    res.json(dashboardStatus);
  } catch (err) {
    next(err);
  }
}