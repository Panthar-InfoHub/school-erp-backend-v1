import { NextFunction, Request, Response } from 'express';
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";

const getProfileImgSchema = Joi.object ({
  employeeId: Joi.string ().required ().regex (/^emp_/),
})


export default async function getEmployeeProfileImg(req: Request, res: Response, next: NextFunction) {
  
  const error = joiValidator(getProfileImgSchema, "params", req, res)
  if (error) {
    next(error)
    return
  }
  
  const {employeeId} = req.params;
  try {
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return
    }
    
    if (!employee.profileImg) {
      res.status(404).json({
        message: "Profile image not found",
      });
      return
    }
    
    // Set the content type header for the image
    // You might need to determine the actual image type if it's not always JPEG
    res.set('Content-Type', 'image/jpeg');
    
    // Send the buffer directly
    res.send(employee.profileImg);
    
  } catch (e) {
    next(e);
  }
}