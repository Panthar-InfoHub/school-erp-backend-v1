import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import ResponseErr from "../../error/responseErr";
import StudentEnrollment from "../../models/studentEnrollment";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import FeePayment from "../../models/feePayment";
import logger from "../../lib/logger";

type resetEnrollmentReqParams = {
  studentId: string;
  enrollmentId: string;
};

type resetEnrollmentReqBody = {
  newFeeAmount?: number;
};

const resetEnrollmentReqParamsSchema = Joi.object<resetEnrollmentReqParams>({
  studentId: Joi.string().required(),
  enrollmentId: Joi.string().required(),
});

const resetEnrollmentReqBodySchema = Joi.object<resetEnrollmentReqBody>({
  newFeeAmount: Joi.number().min(0).optional(),
});

export default async function resetEnrollment(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  const bodyValidationError = joiValidator(resetEnrollmentReqBodySchema, "body", req, res);
  if (bodyValidationError) {
    next(bodyValidationError);
    return;
  }
  
  const paramsError = joiValidator(resetEnrollmentReqParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }
  
  const { studentId, enrollmentId } = req.params;
  const { newFeeAmount } : resetEnrollmentReqBody = req.body;

  const transaction = await sequelize.transaction();
  try {
    // Fetch enrollment with associated monthly fees
    const enrollmentData = await StudentEnrollment.findByPk(enrollmentId, {
      include: [StudentMonthlyFee],
      transaction,
    });
    
    if (!enrollmentData) {
      await transaction.rollback();
      next(new ResponseErr(404, "Enrollment Not Found", "The provided enrollment id does not exist."));
      return;
    }
    
    // Optionally, you could validate that the enrollment belongs to the studentId provided
    if (enrollmentData.studentId !== studentId) {
      await transaction.rollback();
      next(new ResponseErr(403, "Unauthorized", "The enrollment does not belong to the specified student."));
      return;
    }

    if (enrollmentData.isComplete) {
      await transaction.rollback();
      next(new ResponseErr(409, "Enrollment is Complete. Cannot make changes", `Since enrollment is complete, it is archived.
      You can update the enrollment status to active to make changes.`))
      return
    }

    if (!enrollmentData.isActive) {
      await transaction.rollback();
      next(new ResponseErr(400, "Enrollment is not Active Anymore (is Archived Now)", "The enrollment is not active. Please activate it first."))
      return;
    }

    
    // Delete all fee payments belonging to this enrollment
    await FeePayment.destroy({
      where: { enrollmentId: enrollmentData.id },
      transaction,
    });
    
    // Reset all monthly fee entries to their default state
    // If the newFeeAmount is provided, use that; otherwise, use the feeDue stored on the entry.
    const monthlyFees = enrollmentData.monthlyFees;
    
    for (const feeEntry of monthlyFees) {
      // Determine the new fee amount
      const feeDue = newFeeAmount ? newFeeAmount : feeEntry.feeDue;
      
      feeEntry.feeDue = feeDue;
      feeEntry.amountPaid = 0;
      feeEntry.balance = feeDue;
      feeEntry.paidDate = null;
      
      await feeEntry.save({ transaction });
    }
    
    await transaction.commit();
    
    res.status(200).json({
      message: "Enrollment has been reset successfully.",
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error("Failed to reset enrollment fees", error)
    next(error);
  }
}