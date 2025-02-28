import Express from "express";
import Vehicle from "../../models/vehicle";
import logger from "../../lib/logger";

export default async function getAllVehicles(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  logger.info("Starting process to retrieve all vehicles.");

  try {
    // Retrieve all vehicles
    const vehicles = await Vehicle.findAll();

    logger.info(`Retrieved ${vehicles.length} vehicles successfully.`);
    res.status(200).json({
      message: "Vehicles retrieved successfully.",
      vehicles,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error(`Error retrieving vehicles: ${e.message}`);
    }
    next(e);
  }
}