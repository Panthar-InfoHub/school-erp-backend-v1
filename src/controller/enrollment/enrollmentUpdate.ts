import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import StudentEnrollment from "../../models/studentEnrollment";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Define the types for params and body
type updateEnrollmentParams = {
  studentId: string;
  enrollmentId: string;
};

type updateEnrollmentBody = {
  isActive?: boolean;
  isComplete?: boolean;
  one_time_fee?: number;
};

// Create Joi validation schemas
const updateEnrollmentParamsSchema = Joi.object<updateEnrollmentParams>({
  studentId: Joi.string().required(),
  enrollmentId: Joi.string().required(),
});

const updateEnrollmentBodySchema = Joi.object<updateEnrollmentBody>({
  isActive: Joi.boolean().optional(),
  isComplete: Joi.boolean().optional(),
  one_time_fee: Joi.number().optional(),
}).min(1); // Ensures at least one field is provided

// Handler function to update enrollment
export default async function updateEnrollment(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  // Validate URL parameters
  const paramsError = joiValidator(updateEnrollmentParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }

  // Validate request body
  const bodyError = joiValidator(updateEnrollmentBodySchema, "body", req, res);
  if (bodyError) {
    next(bodyError);
    return;
  }

  const { studentId, enrollmentId } = req.params;
  const { isActive, isComplete, one_time_fee } = req.body as updateEnrollmentBody;

  const transaction = await sequelize.transaction();

  try {
    // Fetch the enrollment by primary key
    const enrollment = await StudentEnrollment.findByPk(enrollmentId, { transaction });

    if (!enrollment) {
      await transaction.rollback();
      next(new ResponseErr(404, "Enrollment Not Found", "The provided enrollment id does not exist."));
      return;
    }

    // Validate that the enrollment belongs to the provided student
    if (enrollment.studentId !== studentId) {
      await transaction.rollback();
      next(new ResponseErr(403, "Unauthorized", "The enrollment does not belong to the specified student."));
      return;
    }

    // Update enrollment fields if provided
    if (typeof isActive !== "undefined") {
      enrollment.isActive = isActive;
    }

    if (typeof isComplete !== "undefined") {
      enrollment.isComplete = isComplete;
    }
    
    if (typeof one_time_fee !== "undefined") {
      enrollment.one_time_fee = one_time_fee;
    }

    // Save the updates within the transaction
    await enrollment.save({ transaction });
    await transaction.commit();

    res.status(200).json({
      message: "Enrollment updated successfully.",
      enrollment,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    logger.error("Error updating enrollment", error);
    next(error);
  }
}