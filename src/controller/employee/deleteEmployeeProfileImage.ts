import Express from "express";
import logger from "../../lib/logger";
import Employee from "../../models/employee";

export default async function deleteEmployeeProfileImg(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {

  const { employeeId } = req.params;
  logger.info(`Received request to remove profile image for employeeId: ${employeeId}`);

  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      logger.error(`Employee with id ${employeeId} not found.`);
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    // Remove the profile image by setting it to null
    employee.profileImg = null;
    await employee.save();

    logger.info(`Profile image removed successfully for employee ${employeeId}`);
    res.status(200).json({
      message: "Employee profile image removed successfully",
      employeeId: employee.id,
    });
    return;
  } catch (error: any) {
    logger.error(`Error removing profile image for employee ${employeeId}: ${error.message}`);
    next(error);
    return;
  }
}