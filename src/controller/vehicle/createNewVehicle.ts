import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Vehicle from "../../models/vehicle";
import Driver from "../../models/driver";
import ResponseErr from "../../error/responseErr";
import generateUUID from "../../utils/uuidGenerator";

type createVehicleRequest = {
    vehicleNumber: string,
    driverId: string | undefined
}

const createVehicleRequestSchema = Joi.object<createVehicleRequest>({
    vehicleNumber: Joi.string()
        .pattern(/^[A-Z]{2} \d{2} [A-Z]{2} \d{4}$/)
        .required(),
    driverId: Joi.string().allow("").optional()
        .regex(/^emp_/)
})

export default async function createVehicle(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(createVehicleRequestSchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const body : createVehicleRequest = req.body;
    const transaction = await sequelize.transaction()

    try {

        let driverData: Driver | null = null;

        if (body.driverId) {
            driverData = await Driver.findByPk(body.driverId, {include: [Vehicle], transaction})

            if (!driverData) {
                await transaction.rollback()
                next(new ResponseErr(404, "Could not create the vehicle",
                    "The driver id provided does not exist."))
                return
            }

            if (driverData.vehicle) {
            await transaction.rollback()
            next(new ResponseErr(409, "Could not create the vehicle",
                "The driver already has a vehicle assigned to it."))
                return
        }

        }

        const newVehicleId = `veh_${generateUUID()}`

        const newVehicle = await Vehicle.create({
            id: newVehicleId,
            vehicleNumber: body.vehicleNumber,
            driverId: body.driverId,
        }, {transaction})

        if (body.driverId && driverData) {
            await driverData.update({vehicleId: newVehicleId}, {transaction})
        }

        await transaction.commit()

        res.status(200).json({
            message: "Vehicle Created Successfully",
            vehicleData: newVehicle,
        })

    }

    catch (e) {
        await transaction.rollback();
        if (e instanceof Error) {
            if (e.name === "SequelizeForeignKeyConstraintError") {
                next(new ResponseErr(409, "The driver id provided does not exist.",
                    "The driver id provided does not exist."))
                return
            }
            if (e.name === "SequelizeUniqueConstraintError") {
                next(new ResponseErr(409, "The vehicle number provided already exists.",
                    "The vehicle number provided already exists."))
            }
        }

        next(e)
        return
    }


}