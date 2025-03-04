// updateStudent.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Student from "../../models/student";
import sequelize from "../../lib/seq";
import ResponseErr from "../../error/responseErr";
import {identityEntry} from "../../types";

type UpdateStudentRequest = {
  name?: string;
  address?: string;
  dateOfBirth?: Date;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  ids?: Array<identityEntry>;
  isActive?: boolean;
};

const updateStudentBodySchema = Joi.object<UpdateStudentRequest>({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  fatherName: Joi.string().optional(),
  motherName: Joi.string().optional(),
  fatherPhone: Joi.string().allow("").optional().regex(/^\+?[1-9]\d{1,14}$/),
  motherPhone: Joi.string().allow("").optional().regex(/^\+?[1-9]\d{1,14}$/),
  ids: Joi.array()
    .items(
      Joi.object({
        idDocName: Joi.string().required(),
        idDocValue: Joi.string().required(),
      })
    )
    .optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const updateStudentParamsSchema = Joi.object({
  studentId: Joi.string().pattern(/^stu_/).required(),
});

export default async function updateStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Validate request parameters
  const paramsError = joiValidator(updateStudentParamsSchema, "params", req, res);
  if (paramsError) {
    next(paramsError);
    return;
  }

  // Validate request body
  const bodyError = joiValidator(updateStudentBodySchema, "body", req, res);
  if (bodyError) {
    next(bodyError);
    return;
  }

  const { studentId } = req.params;
  const body: UpdateStudentRequest = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Find the student by studentId
    const student = await Student.findByPk(studentId, { transaction });
    if (!student) {
      await transaction.rollback();
      next(
        new ResponseErr(
          404,
          "Student Not Found",
          "The provided student id does not exist."
        )
      );
      return;
    }

    // Update fields if provided in the body
    if (body.name !== undefined) {
      student.name = body.name;
      student.searchName = body.name.toLowerCase();
    }
    if (body.address !== undefined) {
      student.address = body.address;
    }
    if (body.dateOfBirth !== undefined) {
      student.dateOfBirth = body.dateOfBirth;
    }
    if (body.fatherName !== undefined) {
      student.fatherName = body.fatherName;
    }
    if (body.motherName !== undefined) {
      student.motherName = body.motherName;
    }
    if (body.fatherPhone !== undefined) {
      student.fatherPhone = body.fatherPhone;
    }
    if (body.motherPhone !== undefined) {
      student.motherPhone = body.motherPhone;
    }
    if (body.ids !== undefined) {
      student.ids = body.ids;
    }
    if (body.isActive !== undefined) {
      student.isActive = body.isActive;
    }

    await student.save({ transaction });
    await transaction.commit();

    res.status(200).json({
      message: "Student updated successfully",
      studentData: student,
    });
    return;
  } catch (err) {
    await transaction.rollback();
    next(err);
    return;
  }
}