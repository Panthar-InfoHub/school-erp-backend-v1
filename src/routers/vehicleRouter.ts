import Express from "express";
import createVehicle from "../controller/vehicle/createNewVehicle";
import deleteVehicle from "../controller/vehicle/deleteVehicle";
import updateVehicle from "../controller/vehicle/UpdateVehicle";
import updateVehicleLocation from "../controller/vehicle/UpdateVehicleLocation";
import getVehicle from "../controller/vehicle/GetVehicleDetails";
import getAllVehicles from "../controller/vehicle/GetAllVehiclesWithDrivers";

const router = Express.Router();

// Return all vehicles
router.get("/", getAllVehicles)

// Create new
router.post("/", createVehicle)

router.get("/:vehicleId", getVehicle)

router.put("/:vehicleId", updateVehicle)

router.put("/:vehicleId/location", updateVehicleLocation)

router.delete("/:vehicleId", deleteVehicle)



export default router;