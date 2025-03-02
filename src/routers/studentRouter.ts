import Express from "express";
import createStudent from "../controller/student/addStudent";
import deleteStudent from "../controller/student/deleteStudent";
import updateStudent from "../controller/student/updateStudent";
import getSearchStudents from "../controller/student/getStudentsSearchHandler";
import createNewEnrollment from "../controller/enrollment/newEnrollment";
import payFee from "../controller/enrollment/payFee";
import resetEnrollment from "../controller/enrollment/ResetEnrollmentFees";
import updateEnrollment from "../controller/enrollment/enrollmentUpdate";
import multer from "../middleware/multer";
import updateStudentProfileImg from "../controller/student/updateStudentProfileImg";

const router = Express.Router();

router.get("/", getSearchStudents) // search

router.post('/', createStudent) // create new

router.post("/:studentId/new-enrollment", createNewEnrollment) // create new enrollment for a student

router.post("/:studentId/enrollment/:enrollmentId/fee/pay", payFee)

router.put("/:studentId", updateStudent) // update

router.put("/:studentId/enrollment/:enrollmentId/reset", resetEnrollment) // reset it!

router.patch("/:studentId/enrollment/:enrollmentId/update", updateEnrollment) // update it!

router.delete("/:studentId/enrollment/:enrollmentId")

router.post("/:studentId/image", multer.single("profile_img"), updateStudentProfileImg) // update image

router.delete("/:studentId", deleteStudent) // delete student completely. (only if no payments exist)



export default router;