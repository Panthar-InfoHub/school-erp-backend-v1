import { Request, Response, NextFunction } from 'express';
import Admin from "../../models/admin";
import Employee from "../../models/employee";

export default async function getAllAdmins(req: Request, res: Response, next: NextFunction) {
  
  
  try {
    
    const admins = await Admin.findAll({
      include: [
        {
          model: Employee,
          attributes: ["name", "workRole", "isActive", "isFired", "profileImg"]
        }
      ]
    });
    res.status(200).json({
      message: "Admins fetched successfully.",
      admins,
    });
  }
  
  catch (e) {
    next(e);
  }
}