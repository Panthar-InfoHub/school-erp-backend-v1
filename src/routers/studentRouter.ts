import Express from "express";
import createStudent from "../controller/student/addStudent";
import deleteStudent from "../controller/student/deleteStudent";
import updateStudent from "../controller/student/updateStudent";
import getSearchStudents from "../models/getStudentsSearchHandler";

const router = Express.Router();

router.get("/", getSearchStudents) // search

router.post('/', createStudent) // create new

router.put("/:studentId", updateStudent) // update

router.post("/:studentId/image") // update image

router.delete("/:studentId", deleteStudent) // delete student completely. (only if no payments exist)



export default router;