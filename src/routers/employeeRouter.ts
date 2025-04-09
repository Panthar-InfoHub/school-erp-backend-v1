import Express from "express";
import createEmployee from "../controller/employee/createNewEmployee";
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
import addEmployeeAttendance from "../controller/employee/addEmployeeAttendance";
import updateEmployeeAttendance from "../controller/employee/updateEmployeeAttendance";
import getDailyAttendance from "../controller/employee/getDailyAttendance";
import getEmployeeAttendance from "../controller/employee/getEmployeeAttendance";
import setDateAsHoliday from "../controller/employee/markDayAsHoliday";
import generateDailyAttendanceEntries from "../controller/employee/generateDailyAttendanceEntries";

// Mounted at /employee
const router = Express.Router();

// Get all staff (With Pagination)
router.get("/", searchEmployee);
router.get("/attendance", getDailyAttendance);
router.get("/:employeeId", getEmployeeData);
router.get("/:employeeId/attendance", getEmployeeAttendance);

router.post("/attendance/set-date-as-holiday", setDateAsHoliday)



// Add employee
router.post("/new", createEmployee);
router.post("/login", loginEmployee)
router.post("/attendance/generate", generateDailyAttendanceEntries)

router.post("/:employeeId/image", multer.single("profile_img"), updateEmployeeProfileImg) // update image
router.post("/:employeeId/attendance", addEmployeeAttendance)


router.post("/:employeeId/make-admin", makeAdmin)
router.post("/:employeeId/remove-admin", removeAdmin)


router.put("/:employeeId", updateEmployee);

router.delete("/:employeeId/image", deleteEmployeeProfileImg) // delete image
router.delete("/:employeeId", deleteEmp);


router.patch("/:employeeId/attendance/:attendanceId", updateEmployeeAttendance)




export default router;