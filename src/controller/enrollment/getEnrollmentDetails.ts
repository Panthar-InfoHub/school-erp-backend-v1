import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import StudentEnrollment from "../../models/studentEnrollment";
import ResponseErr from "../../error/responseErr";
import ClassRoom from "../../models/classRoom";
import ClassSection from "../../models/classSections";
import Student from "../../models/student";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import ExamEntry from "../../models/examEntry";
import FeePayment from "../../models/feePayment";

type getEnrollmentDetailsParams = {
	studentId: string,
	enrollmentId: string
}

const getEnrollmentDetailsParamsSchema = Joi.object<getEnrollmentDetailsParams>({
	studentId: Joi.string().required(),
	enrollmentId: Joi.string().required(),
})

export async function getEnrollmentDetails(req: Request, res: Response, next: NextFunction) {

	const error = joiValidator(getEnrollmentDetailsParamsSchema, "params", req, res)
	if (error) {
		next(error)
		return
	}

	const {studentId, enrollmentId} = req.params
	const transaction = await sequelize.transaction()
	console.debug("Getting enrollment details for student with id : ", studentId, " and enrollment with id : ", enrollmentId)

	try {

		const enrollment = await StudentEnrollment.findOne({
			where: {
				studentId,
				id: enrollmentId
			},
			include: [
				ClassRoom,
				ClassSection,
				{
					model: Student,
					attributes: {
						exclude: ["profileImg"]
					}
				},
				StudentMonthlyFee,
				ExamEntry,
				FeePayment,
			],
			transaction
		})

		if (!enrollment) {
			await transaction.rollback()
			return next(new ResponseErr(
				404,
				"Enrollment Not Found",
				"The provided enrollment id does not exist."
			))
		}


		await transaction.commit()


		res.status(200).json({
			message: "Enrollment fetched successfully",
			enrollmentData: enrollment.toJSON(),
		})

	}
	catch (e) {
		await transaction.rollback()
		console.error("Error occurred while fetching enrollment", e)
		next(e)
		return
	}



}
