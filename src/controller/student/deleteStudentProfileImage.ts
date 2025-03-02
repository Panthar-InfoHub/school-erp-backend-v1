import Express from "express";
import Student from "../../models/student";
import logger from "../../lib/logger";

export default async function deleteStudentProfileImg(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {

  const { studentId } = req.params;
  logger.info(`Received request to remove profile image for studentId: ${studentId}`);

  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      logger.error(`Student with id ${studentId} not found.`);
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Remove the profile image by setting it to null
    student.profileImg = null;
    await student.save();

    logger.info(`Profile image removed successfully for student ${studentId}`);
    res.status(200).json({
      message: "Student profile image removed successfully",
      studentId: student.id,
    });
    return;
  } catch (error: any) {
    logger.error(`Error removing profile image for student ${studentId}: ${error.message}`);
    next(error);
    return;
  }
}