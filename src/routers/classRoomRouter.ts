import Express from "express";
import createClassroom from "../controller/classRoom/createClassroom";
import updateClassroom from "../controller/classRoom/updateClassroom";
import getClassroom from "../controller/classRoom/getClassroom";
import deleteClassroom from "../controller/classRoom/deleteClassroom";
import getClassrooms from "../controller/classRoom/getClassrooms";
import createClassSection from "../controller/classRoomSection/createNewSection";


const router = Express.Router();


router.get("/", getClassrooms) // Get All classrooms
router.post("/", createClassroom) // Create a new classroom
router.get("/:classroomId", getClassroom)
router.put("/:classroomId", updateClassroom)
router.delete("/:classroomId", deleteClassroom)

// SECTION classroom Section
router.get("/:classroomId/class-section") // Get All sections
router.post("/:classroomId/class-section", createClassSection) // Create a new section
router.put("/:classroomId/class-section/:classroomSectionId")
router.delete("/:classroomId/class-section/:classroomSectionId")

export default router;