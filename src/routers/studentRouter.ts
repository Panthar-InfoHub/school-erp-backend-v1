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
import deleteStudentProfileImg from "../controller/student/deleteStudentProfileImage";
import deleteEnrollment from "../controller/enrollment/deleteEnrollment";
import getStudentData from "../controller/student/getStudent";
import createExamEntry from "../controller/enrollment/createExamEntry";
import deleteExamEntry from "../controller/enrollment/deleteExamEntry";
import updateExamEntry from "../controller/enrollment/updateExamEntry";
import {getEnrollmentDetails} from "../controller/enrollment/getEnrollmentDetails";
import getStudentProfileImg from "../controller/student/getStudentProfileImg";
import getStudentPayments from "../controller/student/getStudentPayments";

const router = Express.Router();

router.get("/", getSearchStudents) // search

router.post('/', createStudent) // create new

router.post("/:studentId/new-enrollment", createNewEnrollment) // create new enrollment for a student

router.post("/:studentId/enrollment/:enrollmentId/fee/pay", payFee)

router.get("/:studentId", getStudentData) // get

router.get("/:studentId/payments", getStudentPayments)

router.get('/:studentId/profileImg', getStudentProfileImg)

router.get("/:studentId/enrollment/:enrollmentId", getEnrollmentDetails)

router.put("/:studentId", updateStudent) // update

router.put("/:studentId/enrollment/:enrollmentId/reset", resetEnrollment) // reset it!

router.patch("/:studentId/enrollment/:enrollmentId/update", updateEnrollment) // update it!

router.delete("/:studentId/enrollment/:enrollmentId", deleteEnrollment)

router.post("/:studentId/image", multer.single("profile_img"), updateStudentProfileImg) // update image

router.delete("/:studentId/image", deleteStudentProfileImg) // delete image

router.delete("/:studentId", deleteStudent) // delete student completely. (only if no payments exist)

router.post("/:studentId/enrollment/:enrollmentId/exam/new", createExamEntry)

router.patch("/:studentId/enrollment/:enrollmentId/exam/:examEntryId", updateExamEntry)

router.delete("/:studentId/enrollment/:enrollmentId/exam/:examEntryId", deleteExamEntry)

export default router;