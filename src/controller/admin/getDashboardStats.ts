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

    // Get the date for 12 months ago from the current date
    const twelveMonthsAgo = new Date(currentDate);
    twelveMonthsAgo.setMonth(month - 11);
    twelveMonthsAgo.setDate(1); // First day of the month
    twelveMonthsAgo.setHours(0, 0, 0, 0);

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

    // Get all fee payments for the last 12 months
    const last12MonthsPayments = await FeePayment.findAll({
      where: {
        paidOn: { [Op.between]: [twelveMonthsAgo, lastDayOfMonth] }
      },
      attributes: ['paidOn', 'paidAmount'],
      raw: true
    });

    // Group payments by month and calculate total for each month
    const monthlyRevenue: { month: string; revenue: number; monthIndex: number; year: number; }[] = [];
    
    // Initialize all 12 months with zero
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(month - i);
      
      const monthLabel = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue.push({
        month: monthLabel,
        revenue: 0,
        monthIndex: monthDate.getMonth(),
        year: monthDate.getFullYear()
      });
    }

    // Fill in the actual revenue data
    last12MonthsPayments.forEach(payment => {
      const paymentDate = new Date(payment.paidOn);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();
      
      const monthEntry = monthlyRevenue.find(
        m => m.monthIndex === paymentMonth && m.year === paymentYear
      );
      
      if (monthEntry) {
        monthEntry.revenue += Number(payment.paidAmount);
      }
    });

    // Sort by date (newest first)
    monthlyRevenue.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthIndex - a.monthIndex;
    });

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
      monthly_revenue: monthlyRevenue, // Add the monthly revenue data
    };

    res.json(dashboardStatus);
  } catch (err) {
    next(err);
  }
}