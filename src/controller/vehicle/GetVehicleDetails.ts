import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Vehicle from "../../models/vehicle";
import Driver from "../../models/driver";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Schema for validating the params (vehicleId)
const getVehicleParamsSchema = Joi.object({
  vehicleId: Joi.string()
    .pattern(/^veh_/) // ensure the vehicle id follows the expected pattern
    .required(),
});

export default async function getVehicle(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  logger.info("Starting process to retrieve vehicle details.");

  // Validate the request parameters
  const error = joiValidator(getVehicleParamsSchema, "params", req, res);
  if (error) {
    return next(error);
  }

  const { vehicleId } = req.params;

  try {
    // Retrieve the vehicle along with its associated driver details (if any)
    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [Driver],
    });

    if (!vehicle) {
      logger.error(`Vehicle not found: ${vehicleId}`);
      return next(
        new ResponseErr(
          404,
          "Vehicle Not Found",
          "The provided vehicle id does not exist."
        )
      );
    }

    logger.info(`Vehicle ${vehicleId} details retrieved successfully.`);
    res.status(200).json({
      message: "Vehicle details retrieved successfully.",
      vehicleData: vehicle,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error(`Error retrieving vehicle details: ${e.message}`);
    }
    next(e);
  }
}