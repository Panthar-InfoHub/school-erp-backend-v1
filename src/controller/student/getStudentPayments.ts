import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import FeePayment from "../../models/feePayment";

type GetStudentPaymentsParams = {
  studentId: string;
}

type GetStudentPaymentsQuery = {
  page: number;
  limit: number;
}

const getStudentPaymentsParamsSchema = Joi.object<GetStudentPaymentsParams>({
  studentId: Joi.string().required()
});

const getStudentPaymentsQuerySchema = Joi.object<GetStudentPaymentsQuery>({
  page: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().positive().required(),
});

export default async function getStudentPayments(req: Request, res: Response, next: NextFunction) {
  // Validate parameters
  const paramsError = joiValidator(getStudentPaymentsParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }

  // Validate query parameters
  const queryError = joiValidator(getStudentPaymentsQuerySchema, "query", req, res);
  if (queryError) {
    next(queryError);
    return;
  }

  try {
    const { studentId } = req.params;
    let { page, limit } = req.query;

    
    // Query payments with pagination
    const { rows: payments, count } = await FeePayment.findAndCountAll({
      where: {
        studentId: studentId
      },
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['paidOn', 'DESC']], // Most recent payments first
    });

    // Return the results
    res.status(200).json({
      message: "Student payments fetched successfully",
      payments,
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      itemsPerPage: Number(limit)
    });
  } catch (error) {
    next(error);
    return;
  }
}