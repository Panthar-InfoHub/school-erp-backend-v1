import Express from "express";
import createStudent from "../controller/student/addStudent";
import deleteStudent from "../controller/student/deleteStudent";

const router = Express.Router();

router.get("/") // search

router.post('/', createStudent) // create new

router.put("/:studentId") // update

router.post("/:studentId/image") // update image

router.delete("/:studentId", deleteStudent) // delete student completely. (only if no payments exist)



export default router;