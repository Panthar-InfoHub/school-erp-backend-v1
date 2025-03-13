import Express from "express";
import Student from "../../models/student";
import sequelize from "../../lib/seq";
import logger from "../../lib/logger";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import ResponseErr from "../../error/responseErr";

type deleteStudentBody= {
    force?: boolean;
}

const deleteStudentQuerySchema = Joi.object<deleteStudentBody>({
    force: Joi.boolean().optional(),
})

export default async function deleteStudent(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    const { studentId } = req.params;

    const error = joiValidator(deleteStudentQuerySchema, "query", req, res)
    if (error) {
        next(error)
        return
    }

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
            console.log("Student not found");
            res.status(404).json({ error: "Student not found" });
            return;
        }

        // Check if enrollments exist and verify that none have fee information
        if (student.studentEnrollments && student.studentEnrollments.length > 0) {
            for (const enrollment of student.studentEnrollments) {
                if (enrollment.monthlyFees && enrollment.monthlyFees.length > 0 && !req.body.force) {
                    next(new ResponseErr(
                        400,
                        "Student Deletion Error",
                        "Cannot delete student as there are fee payment entries associated with it."
                    ))
                    return;
                } else {
                    logger.info(`Deleting enrollment entry with id: ${enrollment.id}`);
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