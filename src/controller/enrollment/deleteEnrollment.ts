import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import StudentEnrollment from "../../models/studentEnrollment";
import logger from "../../lib/logger";

type DeleteEnrollmentRequestQuery = {
  force?: boolean;
};

const deleteEnrollmentRequestQuerySchema = Joi.object({
  force: Joi.boolean().optional(),
});

export default async function deleteEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Validate request body
  const error = joiValidator(deleteEnrollmentRequestQuerySchema, "query", req, res);
  if (error) {
    next(error);
    return;
  }

  // Get parameters and force flag
  const { studentId, enrollmentId } = req.params;
  const force: boolean = Boolean(req.query.force) || false;

  logger.info(
    `Received request to delete enrollment entry ${enrollmentId} for student ${studentId} with force flag: ${force}`
  );

  const transaction = await sequelize.transaction();

  try {
    // Assuming the StudentEnrollment model is set up to include feePayment entries via an association (e.g., feePayments)
    const enrollment = await StudentEnrollment.findOne({
      where: { id: enrollmentId, studentId },
      include: [
        {
          association: "feePayments", // ensure that this association is defined in your StudentEnrollment model
        },
      ],
      transaction,
    });

    if (!enrollment) {
      logger.error(
        `Enrollment entry not found with id ${enrollmentId} for student ${studentId}`
      );
      res.status(404).json({ error: "Enrollment entry not found" });
      return;
    }

    // Check if fee payment entries exist in this enrollment
    if (
      enrollment.monthlyFees &&
      enrollment.monthlyFees.length > 0 &&
      !force
    ) {
      logger.error(
        `Cannot delete enrollment entry ${enrollmentId} because it has associated fee payment records.`
      );
      res.status(400).json({
        error: "Cannot delete enrollment entry with fee payments. Use force flag to delete.",
      });
      return;
    }

    logger.info(`Deleting enrollment entry with id: ${enrollmentId}`);
    await enrollment.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      message: "Enrollment entry deleted successfully",
      enrollmentId,
    });
  } catch (error: any) {
    await transaction.rollback();
    logger.error(`Error deleting enrollment entry ${enrollmentId}: ${error.message}`);
    next(error);
  }
}