import Express from "express";
import Student from "../../models/student";
import sequelize from "../../lib/seq";
import logger from "../../lib/logger";

export default async function deleteStudent(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const { studentId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findOne({
      where: { id: studentId },
      include: [{
        association: "studentEnrollments",
        include: ["monthlyFees"],
      }],
      transaction,
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Check if enrollments exist and verify that none have fee information
    if (student.studentEnrollments && student.studentEnrollments.length > 0) {
      for (const enrollment of student.studentEnrollments) {
        if (enrollment.monthlyFees && enrollment.monthlyFees.length > 0) {
          res.status(400).json({ error: "Cannot delete student with fee information in enrollment entries." });
          return;
        }
      }

      // Delete enrollment entries that exist but have no fee info
      await Promise.all(
        student.studentEnrollments.map(enrollment => enrollment.destroy({ transaction }))
      );
    }

    // Delete the student after all checks are passed
    await student.destroy({ transaction });
    await transaction.commit();

    logger.debug(`Student deleted successfully: ${studentId}`);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    next(error);
  }
}