import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import StudentEnrollment from "../../models/studentEnrollment";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import { Op } from "sequelize";
import Student from "../../models/student";

type getClassroomSectionStudentsQuery = {
  startPeriod: Date;
  endPeriod: Date;
  activeOnly?: boolean;
};

const getClassroomSectionStudentsQuerySchema = Joi.object<getClassroomSectionStudentsQuery>({
  startPeriod: Joi.date().required(),
  endPeriod: Joi.date().required(),
  activeOnly: Joi.boolean().optional(),
});

const getClassroomSectionStudentsParamsSchema = Joi.object({
  classroomId: Joi.string().required(),
  classroomSectionId: Joi.string().required(),
});

export default async function getClassroomSectionStudentsInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = joiValidator(getClassroomSectionStudentsParamsSchema, "params", req, res);
  if (error) {
    next(error);
    return;
  }

  const queryError = joiValidator(getClassroomSectionStudentsQuerySchema, "query", req, res);
  if (queryError) {
    next(queryError);
    return;
  }

  const { classroomId, classroomSectionId } = req.params;
  const { startPeriod, endPeriod } = req.query;

  try {
    logger.info("Getting students for classroom with id:", classroomId, "with query:", req.query);

    const enrollments = await StudentEnrollment.findAll({
      where: {
        classroomId: classroomId,
        classroomSectionId: classroomSectionId,
        [Op.and]: [
          { sessionStart: { [Op.lt]: new Date(endPeriod as string) } },
          { sessionEnd: { [Op.gt]: new Date(startPeriod as string) } }
        ]
      },
      attributes: ["id", "studentId", "classroomSectionId", "sessionStart", "sessionEnd", "monthlyFee", "isActive"],
      include: [
        {
          model: Student,
        },
        {
          // Include monthly fees temporarily for fee calculations
          model: StudentMonthlyFee,
          attributes: ["feeDue", "amountPaid", "balance", "paidDate"]
        }
      ]
    });

    const processedData = enrollments.map((enrollment) => {
      const monthlyFees = (enrollment.get("monthlyFees") as StudentMonthlyFee[]) || [];

      // Sum the remaining balance across all monthly fees
      const feeDueTotal = monthlyFees.reduce((acc, fee) => acc + (fee.balance || 0), 0);

      // Mark as completely paid if every fee has a zero balance and a non-null paidDate
      const feeCompletelyPaid =
        monthlyFees.length > 0 && monthlyFees.every((fee) => fee.balance === 0 && fee.paidDate !== null);

      // Determine the last payment date across all monthly fees that have been paid
      const lastPaymentDate = monthlyFees
        .filter((fee) => fee.paidDate !== null)
        .reduce<Date | null>((latest, fee) => {
          const feePaidDate = new Date(fee.paidDate as unknown as string);
          if (!latest || feePaidDate > latest) {
            return feePaidDate;
          }
          return latest;
        }, null);

      // Remove monthlyFees from the returned object
      const enrollmentData = enrollment.toJSON() as any;
      delete enrollmentData.monthlyFees;

      return {
        ...enrollmentData,
        feeDueTotal,
        feeCompletelyPaid,
        lastPaymentDate, // will be null if there is no payment date found
      };
    });

    res.status(200).json({
      message: "Students fetched successfully",
      students: processedData,
    });
    return;
  } catch (e) {
    console.assert(process.env.NODE_ENV === "development", e);
    logger.error("Failed to get students for classroom with id:", classroomId, "with query:", req.query, e);
    next(e);
    return;
  }
}