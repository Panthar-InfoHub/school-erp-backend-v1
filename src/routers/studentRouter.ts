import Express from "express";
import createStudent from "../controller/student/addStudent";
import deleteStudent from "../controller/student/deleteStudent";
import updateStudent from "../controller/student/updateStudent";
import getSearchStudents from "../controller/student/getStudentsSearchHandler";
import createNewEnrollment from "../controller/enrollment/newEnrollment";

const router = Express.Router();

router.get("/", getSearchStudents) // search

router.post('/', createStudent) // create new

router.post("/:studentId/new-enrollment", createNewEnrollment) // create new enrollment for a student

router.post(":/studentId/enrollment/:enrollmentId/reset") // reset it!

router.put("/:studentId", updateStudent) // update

router.post("/:studentId/image") // update image

router.delete("/:studentId", deleteStudent) // delete student completely. (only if no payments exist)



export default router;