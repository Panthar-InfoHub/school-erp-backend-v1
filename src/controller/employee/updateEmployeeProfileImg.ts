import Express from "express";
import logger from "../../lib/logger";
import Employee from "../../models/employee"; // Adjust the path as needed to your logger module


export default async function updateEmployeeProfileImg(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {

  const { employeeId } = req.params;
  logger.info(`Received request to update profile image for employeeId: ${employeeId}`);

  if (!req.file) {
    logger.error("No profile image provided in the request.");
    res.status(400).json({ error: "No profile image provided" });
    return;
  }

  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      logger.error(`Employee with id ${employeeId} not found.`);
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    employee.profileImg = req.file.buffer;
    await employee.save();
    logger.info(`Profile image updated successfully for employee ${employeeId}`);

    res.status(200).json({
      message: "Employee profile image updated successfully",
      employeeId: employee.id,
    });
    return;
  } catch (error: any) {
    logger.error(`Error updating profile image for employee ${employeeId}: ${error.message}`);
    next(error);
    return;
  }
}