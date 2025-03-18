// updateSection.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import ClassSection from "../../models/classSections";
import ClassRoom from "../../models/classRoom";
import ResponseErr from "../../error/responseErr";

type UpdateSectionRequest = {
	name?: string;
	defaultFee?: number;
	isActive?: boolean;
	subjects?: Array<{
		name: string;
		code: string;
		theoryExam: boolean;
		practicalExam: boolean;
	}>;
};

const updateSectionBodySchema = Joi.object<UpdateSectionRequest>({
	name: Joi.string().optional(),
	defaultFee: Joi.number().min(1),
	isActive: Joi.boolean().optional(),
	subjects: Joi.array().items(
		Joi.object({
			name: Joi.string().required(),
			code: Joi.string().required(),
			theoryExam: Joi.boolean().required(),
			practicalExam: Joi.boolean().required(),
		}).optional()
	),
}).min(1); // Ensure at least one key is provided

const updateSectionParamsSchema = Joi.object({
	classroomId: Joi.string().pattern(/^classroom_/).required(),
	classroomSectionId: Joi.string().pattern(/^section_/).required(),
});

export default async function updateSection(
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Validate the request body first
	const bodyError = joiValidator(updateSectionBodySchema, "body", req, res);
	if (bodyError) {
		next(bodyError);
		return;
	}
	
	// Validate the request parameters
	const paramsError = joiValidator(updateSectionParamsSchema, "params", req, res);
	if (paramsError) {
		next(paramsError);
		return;
	}
	
	const { classroomId, classroomSectionId } = req.params;
	const body: UpdateSectionRequest = req.body;
	
	try {
		// Ensure the classroom exists
		const classroom = await ClassRoom.findByPk(classroomId);
		if (!classroom) {
			logger.error(`Classroom not found: ${classroomId}`);
			return next(
				new ResponseErr(
					404,
					"Classroom Not Found",
					"The provided classroom id does not exist."
				)
			);
		}
		
		// Find the section to update
		const section = await ClassSection.findByPk(classroomSectionId);
		if (!section) {
			logger.error(`Section not found: ${classroomSectionId}`);
			return next(
				new ResponseErr(
					404,
					"Section Not Found",
					"The provided section id does not exist."
				)
			);
		}
		
		// Ensure the section belongs to the provided classroom
		if (section.classRoomId !== classroomId) {
			logger.error(`Section ${classroomSectionId} does not belong to classroom ${classroomId}`);
			return next(
				new ResponseErr(
					400,
					"Mismatch Error",
					"The section does not belong to the specified classroom."
				)
			);
		}
		
		logger.debug(`Updating section: ${classroomSectionId}`);
		
		// Update the section details only if provided in the body
		if (body.name !== undefined) {
			section.name = body.name;
		}
		if (body.defaultFee !== undefined) {
			section.defaultFee = body.defaultFee;
		}
		if (body.subjects !== undefined) {
			section.subjects = body.subjects;
		}
		if (body.isActive !== undefined) {
			section.isActive = body.isActive;
		}
		
		await section.save();
		
		logger.info(`Section updated successfully: ${section.id}`);
		
		res.status(200).json({
			message: "Section updated successfully",
			classSectionData: section,
		});
	} catch (err) {
		logger.error("Failed to update classroom section", err);
		if (err instanceof Error && err.name === "SequelizeUniqueConstraintError") {
			return next(
				new ResponseErr(
					409,
					"The section name provided already exists.",
					"The section name provided already exists."
				)
			);
		}
		next(err);
	}
}