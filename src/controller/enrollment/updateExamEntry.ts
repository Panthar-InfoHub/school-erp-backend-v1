import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import ExamEntry from "../../models/examEntry";
import StudentEnrollment from "../../models/studentEnrollment";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Define params schema
const updateExamEntryParamsSchema = Joi.object({
	examEntryId: Joi.string().required(),
	studentId: Joi.string().required(),
	enrollmentId: Joi.string().required(),
});



// Define a schema for each subject in the subject array
const subjectUpdateSchema = Joi.object({
		name: Joi.string().required(),
		code: Joi.string().required(),
		theoryExam: Joi.boolean().required(),
		practicalExam: Joi.boolean().required(),
		obtainedMarksTheory: Joi.number().allow(null)
			.when('theoryExam', {
				is: true,
				then: Joi.required().messages({
					'any.required': 'obtainedMarksTheory is required when theoryExam is true for subject {{#subject}}'
				})
			}),
		obtainedMarksPractical: Joi.number().allow(null)
			.when('practicalExam', {
				is: true,
				then: Joi.required().messages({
					'any.required': 'obtainedMarksPractical is required when practicalExam is true for subject {{#subject}}'
				})
			}),
		totalMarksTheory: Joi.number().allow(null)
			.when('theoryExam', {
				is: true,
				then: Joi.required().messages({
					'any.required': 'totalMarksTheory is required when theoryExam is true for subject {{#subject}}'
				})
			}),
		totalMarksPractical: Joi.number().allow(null)
			.when('practicalExam', {
				is: true,
				then: Joi.required().messages({
					'any.required': 'totalMarksPractical is required when practicalExam is true for subject {{#subject}}'
				})
			}),
		totalMarks: Joi.number().allow(null).required()
	})
	.custom((value, helpers) => {
		// Validate theory marks
		if (value.theoryExam && value.obtainedMarksTheory !== null && value.totalMarksTheory !== null) {
			if (value.obtainedMarksTheory > value.totalMarksTheory) {
				return helpers.error('marks.theory.exceed', {
					subject: value.name,
					marks: value.obtainedMarksTheory,
					total: value.totalMarksTheory
				});
			}
		}
		
		// Validate practical marks
		if (value.practicalExam && value.obtainedMarksPractical !== null && value.totalMarksPractical !== null) {
			if (value.obtainedMarksPractical > value.totalMarksPractical) {
				return helpers.error('marks.practical.exceed', {
					subject: value.name,
					marks: value.obtainedMarksPractical,
					total: value.totalMarksPractical
				});
			}
		}
		
		// Calculate total marks
		let calculatedTotal = 0;
		if (value.theoryExam && value.totalMarksTheory !== null) {
			calculatedTotal += value.totalMarksTheory;
		}
		if (value.practicalExam && value.totalMarksPractical !== null) {
			calculatedTotal += value.totalMarksPractical;
		}
		
		// Only validate total if we have all required components
		if ((value.theoryExam && value.totalMarksTheory === null) ||
			(value.practicalExam && value.totalMarksPractical === null)) {
			return helpers.error('marks.missing.components', {
				subject: value.name
			});
		}
		
		if (value.totalMarks !== calculatedTotal) {
			return helpers.error('marks.total.mismatch', {
				subject: value.name,
				total: value.totalMarks,
				calculated: calculatedTotal
			});
		}
		
		return value;
	})
	.messages({
		'marks.theory.exceed': 'For subject {{#subject}}, obtained theory marks ({{#marks}}) cannot exceed total theory marks ({{#total}})',
		'marks.practical.exceed': 'For subject {{#subject}}, obtained practical marks ({{#marks}}) cannot exceed total practical marks ({{#total}})',
		'marks.total.mismatch': 'For subject {{#subject}}, total marks ({{#total}}) must equal sum of total theory marks and practical marks ({{#calculated}})',
		'marks.missing.components': 'For subject {{#subject}}, please provide all required marks components based on exam types',
		'any.required': '{{#key}} is required for subject {{#subject}}',
		'number.base': '{{#key}} must be a number for subject {{#subject}}'
	});// Define the body schema for exam entry update.
// All fields are optional, but at least one must exist.
const updateExamEntryBodySchema = Joi.object({
		examName: Joi.string().optional(),
		examType: Joi.string().optional(),
		examDate: Joi.date().optional(),
		term: Joi.string().optional(),
		note: Joi.string().allow("").optional(),
		subjects: Joi.array().items(subjectUpdateSchema).optional(),
		studentPassed: Joi.boolean().optional(),
	})
	.min(1)
	.messages({
		"object.min":
			"At least one field must be provided. Allowed fields: examName, note, examType, examDate, subjects, studentPassed.",
	} as Joi.LanguageMessages);

export default async function updateExamEntry(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Validate the request body
	logger.info("Validating update exam entry request body");
	const bodyError = joiValidator(updateExamEntryBodySchema, "body", req, res);
	if (bodyError) {
		next(bodyError);
		return;
	}
	
	// Validate request params
	logger.info("Validating update exam entry request parameters");
	const paramsError = joiValidator(updateExamEntryParamsSchema, "params", req, res);
	if (paramsError) {
		next(paramsError);
		return;
	}
	
	const { examEntryId, studentId, enrollmentId } = req.params;
	const updateFields = req.body;
	
	try {
		logger.info(
			`Fetching exam entry with examEntryId: ${examEntryId}, studentId: ${studentId}, enrollmentId: ${enrollmentId}`
		);
		
		// Find the exam entry using the provided identifiers
		const examEntry = await ExamEntry.findOne({
			where: { examEntryId, studentId, enrollmentId },
		});
		
		if (!examEntry) {
			logger.error("Exam entry not found");
			next(
				new ResponseErr(
					404,
					"Exam entry not found",
					"No exam entry matching the provided identifiers was found."
				)
			);
			return;
		}
		
		// If subjects are provided, verify the subjects count against enrollment details
		if (updateFields.subjects) {
			logger.info("Verifying subjects array length against enrollment subjects");
			const enrollment = await StudentEnrollment.findByPk(enrollmentId);
			if (!enrollment) {
				logger.error("Enrollment not found");
				next(
					new ResponseErr(
						404,
						"Enrollment Not Found",
						"The provided enrollment id does not exist."
					)
				);
				return;
			}
			if (enrollment.subjects.length !== updateFields.subjects.length) {
				logger.error("Subjects array length mismatch");
				next(
					new ResponseErr(
						400,
						"Subjects Mismatch",
						"The subjects array length must match the enrollment subjects count."
					)
				);
				return;
			}
		}
		
		// Update allowed fields if present so that each update is applied individually
		if (updateFields.examName !== undefined) {
			examEntry.examName = updateFields.examName;
		}
		
		if (updateFields.examType !== undefined) {
			examEntry.examType = updateFields.examType;
		}
		
		if (updateFields.examDate !== undefined) {
			examEntry.examDate = updateFields.examDate;
		}
		
		if (updateFields.note !== undefined) {
			examEntry.note = updateFields.note;
		}
		
		if (updateFields.subjects !== undefined) {
			examEntry.subjects = updateFields.subjects;
		}
		
		if (updateFields.studentPassed !== undefined) {
			examEntry.studentPassed = updateFields.studentPassed;
		}
		
		if (updateFields.term !== undefined) {
			examEntry.term = updateFields.term;
		}
		
		logger.info("Saving updated exam entry");
		await examEntry.save();
		
		res.status(200).json({
			message: "Exam entry updated successfully",
			examEntryData: examEntry,
		});
		return;
	} catch (e) {
		logger.error("Error while updating exam entry", e);
		next(e);
		return;
	}
}