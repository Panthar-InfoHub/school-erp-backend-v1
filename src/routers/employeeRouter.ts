import Express from "express";
import createEmployee from "../controller/employee/createNew";
import searchEmployee from "../controller/employee/search";
import updateEmployee from "../controller/employee/update";
import deleteEmp from "../controller/employee/deleteEmp";

// Mounted at /employee
const router = Express.Router();

// Get all staff (With Pagination)
router.get("/", searchEmployee);

// Add employee
router.post("/new", createEmployee);

// Update
router.put("/:employeeId", updateEmployee);

// Delete
router.delete("/:employeeId", deleteEmp);




export default router;