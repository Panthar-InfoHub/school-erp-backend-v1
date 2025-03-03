import Express from "express";
import createEmployee from "../controller/employee/createNew";
import searchEmployee from "../controller/employee/search";
import updateEmployee from "../controller/employee/update";
import deleteEmp from "../controller/employee/deleteEmp";
import loginEmployee from "../controller/employee/login";
import getEmployeeData from "../controller/employee/getEmployee";
import multer from "../middleware/multer";
import deleteEmployeeProfileImg from "../controller/employee/deleteEmployeeProfileImage";
import updateEmployeeProfileImg from "../controller/employee/updateEmployeeProfileImg";
import makeAdmin from "../controller/admin/makeAdmin";
import removeAdmin from "../controller/admin/removeAdmin";

// Mounted at /employee
const router = Express.Router();

// Get all staff (With Pagination)
router.get("/", searchEmployee);

router.get("/:employeeId", getEmployeeData);


// Add employee
router.post("/new", createEmployee);

router.post("/:employeeId/image", multer.single("profile_img"), updateEmployeeProfileImg) // update image

router.delete("/:employeeId/image", deleteEmployeeProfileImg) // delete image

// Update
router.put("/:employeeId", updateEmployee);

// Delete
router.delete("/:employeeId", deleteEmp);

router.post("/login", loginEmployee)

router.post("/:employeeId/make-admin", makeAdmin)
router.post("/:employeeId/remove-admin", removeAdmin)





export default router;