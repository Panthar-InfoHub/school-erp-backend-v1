import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Vehicle from "../../models/vehicle";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Schema for validating the params (vehicleId)
const updateLocationParamsSchema = Joi.object({
  vehicleId: Joi.string()
    .pattern(/^veh_/) // ensure the vehicle id follows the expected pattern
    .required(),
});

// Schema for validating the request body (lat and long)
const updateLocationBodySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  long: Joi.number().min(-180).max(180).required(),
});

export default async function updateVehicleLocation(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  logger.info("Starting vehicle location update process.");

  // Validate the request params
  const paramError = joiValidator(updateLocationParamsSchema, "params", req, res);
  if (paramError) {
    return next(paramError);
  }

  // Validate the request body
  const bodyError = joiValidator(updateLocationBodySchema, "body", req, res);
  if (bodyError) {
    return next(bodyError);
  }

  const { vehicleId } = req.params;
  const { lat, long } = req.body;
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

    // Update the vehicle location
    logger.info(`Updating location for vehicle ${vehicleId} to lat: ${lat}, long: ${long}.`);
    vehicle.latest_lat = lat;
    vehicle.latest_long = long;

    // Save updated vehicle and commit changes
    await vehicle.save({ transaction });
    await transaction.commit();

    logger.info(`Vehicle ${vehicleId} location updated successfully.`);
    res.status(200).json({
      message: "Vehicle location updated successfully.",
      vehicleData: vehicle,
    });
  } catch (e: unknown) {
    await transaction.rollback();
    if (e instanceof Error) {
      logger.error(`Error updating vehicle location: ${e.message}`);
    }
    next(e);
  }
}