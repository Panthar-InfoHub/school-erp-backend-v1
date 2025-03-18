import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Vehicle from "../../models/vehicle";
import ResponseErr from "../../error/responseErr";
import logger from "../../lib/logger";

// Schema for validating the params (vehicleId)
const delinkParamsSchema = Joi.object({
  vehicleId: Joi.string()
    .pattern(/^veh_/) // ensure the vehicle id follows the expected pattern
    .required(),
});

export default async function delinkVehicleDriver(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  logger.info("Starting delink process for vehicle.");

  // Validate the request params
  const error = joiValidator(delinkParamsSchema, "params", req, res);
  if (error) {
    return next(error);
  }

  const { vehicleId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // Retrieve the vehicle by primary key within the transaction
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
    
    await vehicle.save({ transaction });

    await transaction.commit();
    logger.info(`Successfully delinked vehicle ${vehicleId} from its driver.`);
    res.status(200).json({
      message: "Vehicle delinked successfully.",
    });
  } catch (e: unknown) {
    await transaction.rollback();
    if (e instanceof Error) {
      logger.error(`Error during delink process: ${e.message}`);
    }
    next(e);
  }
}