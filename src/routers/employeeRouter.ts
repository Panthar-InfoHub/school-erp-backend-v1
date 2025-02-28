import Express from "express";
import createEmployee from "../controller/employee/createNew";

// Mounted at /employee
const router = Express.Router();

// Get all staff (With Pagination)
router.post("/all");

// Add employee
router.post("/new", createEmployee);

// Update
router.put("/:employeeId");

// Delete
router.delete("/:employeeId");




export default router;