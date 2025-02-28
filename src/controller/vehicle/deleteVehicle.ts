
import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Vehicle from "../../models/vehicle";
import Driver from "../../models/driver";
import ResponseErr from "../../error/responseErr";

const deleteVehicleParamsSchema = Joi.object({
    vehicleId: Joi.string()
        .pattern(/^veh_/)  // Ensuring the vehicle id follows the expected pattern
        .required()
});

export default async function deleteVehicle(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
) {
    // Validate the request params
    const error = joiValidator(deleteVehicleParamsSchema, "params", req, res);
    if (error) {
        return next(error);
    }

    const { vehicleId } = req.params;
    const transaction = await sequelize.transaction();

    try {
        // Retrieve the vehicle entry by primary key
        const vehicle = await Vehicle.findByPk(vehicleId, { transaction });
        if (!vehicle) {
            await transaction.rollback();
            return next(
                new ResponseErr(404, "Vehicle Not Found", "The vehicle id provided does not exist.")
            );
        }

        // If a driver is associated with this vehicle, detach it by setting vehicle_id to null
        const driver = await Driver.findOne({ where: { vehicle_id: vehicleId }, transaction });
        if (driver) {
            await driver.update({ vehicle_id: null }, { transaction });
        }

        // Delete the vehicle record
        await vehicle.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Vehicle deleted successfully."
        });
    } catch (e) {
        await transaction.rollback();
        next(e);
    }
}