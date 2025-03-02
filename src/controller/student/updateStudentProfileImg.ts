import Express from "express";
import Student from "../../models/student";
import logger from "../../lib/logger"; // Adjust the path as needed to your logger module

export default async function updateStudentProfileImg(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {

  const { studentId } = req.params;
  logger.info(`Received request to update profile image for studentId: ${studentId}`);

  if (!req.file) {
    logger.error("No profile image provided in the request.");
    res.status(400).json({ error: "No profile image provided" });
    return;
  }

  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      logger.error(`Student with id ${studentId} not found.`);
      res.status(404).json({ error: "Student not found" });
      return;
    }

    student.profileImg = req.file.buffer;
    await student.save();
    logger.info(`Profile image updated successfully for student ${studentId}`);

    res.status(200).json({
      message: "Student profile image updated successfully",
      studentId: student.id,
    });
    return;
  } catch (error: any) {
    logger.error(`Error updating profile image for student ${studentId}: ${error.message}`);
    next(error);
    return;
  }
}