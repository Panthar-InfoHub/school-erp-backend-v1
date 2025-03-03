// getStudent.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import Student from "../../models/student";
import StudentEnrollment from "../../models/studentEnrollment";
import ResponseErr from "../../error/responseErr";

const getStudentParamsSchema = Joi.object({
    studentId: Joi.string().required(),
});

export default async function getStudentData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Validate query parameters
  const paramsErr = joiValidator(getStudentParamsSchema, "params", req, res);
  if (paramsErr) {
    next(paramsErr);
    return;
  }

  const {studentId} = req.params


  try {
    logger.info(`Searching for student with id ${studentId}`);


    const student = await Student.findByPk(req.params.studentId, {
        include: [{
            model: StudentEnrollment,
        }]
    })

    if (!student) {
        next(new ResponseErr(
            404,
            "No student Found",
            "Invalid Identifier was supplied with this action!"
        ))
    }

    res.status(200).json({
      message: "Student fetched successfully",
      student,
    });
    return;
  } catch (err) {
    logger.error("Error occurred while searching for student", err);
    next(err);
    return;
  }
}