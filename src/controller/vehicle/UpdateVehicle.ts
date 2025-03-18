import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Vehicle from "../../models/vehicle";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Schema for validating the params (vehicleId)
const updateVehicleParamsSchema = Joi.object({
	vehicleId: Joi.string()
		.pattern(/^veh_/) // ensure the vehicle id follows the expected pattern
		.required(),
});

// Schema for validating the request body
const updateVehicleBodySchema = Joi.object({
		vehicleNumber: Joi.string()
			.pattern(/^[A-Z]{2} \d{2} [A-Z]{2} \d{4}$/)
			.optional(),
		driverId: Joi.string()
			.allow("")
			.optional()
			.regex(/^emp_/),
	})
	.or("vehicleNumber", "driverId") // custom check: at least one field must be provided
	.messages({
		"object.missing": "At least one field (vehicleNumber or driverId) must be provided.",
	});

export default async function updateVehicle(
	req: Express.Request,
	res: Express.Response,
	next: Express.NextFunction
) {
	logger.info("Starting vehicle update process.");
	
	// Validate the request params
	let error = joiValidator(updateVehicleParamsSchema, "params", req, res);
	if (error) {
		return next(error);
	}
	
	// Validate the request body
	error = joiValidator(updateVehicleBodySchema, "body", req, res);
	if (error) {
		return next(error);
	}
	
	const { vehicleId } = req.params;
	const { vehicleNumber } = req.body;
	const transaction = await sequelize.transaction();
	
	try {
		// Retrieve the vehicle entry by primary key
		const vehicle = await Vehicle.findByPk(vehicleId, { transaction });
		if (!vehicle) {
			await transaction.rollback();
			logger.error(`Vehicle not found: ${vehicleId}`);
			return next(
				new ResponseErr(
					404,
					"Vehicle Not Found",
					"The provided vehicle id does not exist."
				)
			);
		}
		
		// If a new vehicleNumber is provided, update it.
		if (vehicleNumber) {
			logger.info(
				`Updating vehicle number from ${vehicle.vehicleNumber} to ${vehicleNumber}.`
			);
			vehicle.vehicleNumber = vehicleNumber;
		}
		
		
		// Save the updated vehicle record and commit the transaction.
		await vehicle.save({ transaction });
		await transaction.commit();
		
		logger.info(`Vehicle ${vehicleId} updated successfully.`);
		res.status(200).json({
			message: "Vehicle updated successfully.",
			vehicleData: vehicle,
		});
	} catch (e) {
		await transaction.rollback();
		if (e instanceof Error) {
			logger.error(`Error updating vehicle: ${e.message}`);
			if (e.name === "SequelizeForeignKeyConstraintError") {
				return next(
					new ResponseErr(
						409,
						"Invalid Driver ID",
						"The driver id provided is not correct."
					)
				);
			}
			if (e.name === "SequelizeUniqueConstraintError") {
				return next(
					new ResponseErr(
						409,
						"Conflict",
						"The vehicle number provided already exists."
					)
				);
			}
		}
		next(e);
	}
}