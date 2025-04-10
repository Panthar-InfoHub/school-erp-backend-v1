import { NextFunction, Request, Response } from 'express';
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Student from "../../models/student";

const getProfileImgSchema = Joi.object ({
  studentId: Joi.string ().required ().regex (/^stu_/),
})


export default async function getStudentProfileImg(req: Request, res: Response, next: NextFunction) {
  
  const error = joiValidator(getProfileImgSchema, "params", req, res)
  if (error) {
    next(error)
    return
  }
  
  const {studentId} = req.params;
  try {
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      res.status(404).json({
        message: "Student not found",
      });
      return
    }
    
    if (!student.profileImg) {
      res.status(404).json({
        message: "Profile image not found",
      });
      return
    }
    
    // Set the content type header for the image
    // You might need to determine the actual image type if it's not always JPEG
    res.set('Content-Type', 'image/jpeg');
    
    // Send the buffer directly
    res.send(student.profileImg);
    
  } catch (e) {
    next(e);
  }
}