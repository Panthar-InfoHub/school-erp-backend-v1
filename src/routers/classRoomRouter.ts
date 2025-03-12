import Express from "express";
import createClassroom from "../controller/classRoom/createClassroom";
import updateClassroom from "../controller/classRoom/updateClassroom";
import getClassroom from "../controller/classRoom/getClassroom";
import deleteClassroom from "../controller/classRoom/deleteClassroom";
import getClassrooms from "../controller/classRoom/getClassrooms";
import createClassSection from "../controller/classRoomSection/createNewSection";
import updateSection from "../controller/classRoomSection/UpdateClassSection";
import deleteSection from "../controller/classRoomSection/deleteClassSection";
import getClassSections from "../controller/classRoomSection/getClassSectionsHandler";
import getClassroomStudentsInfo from "../controller/classRoom/getClassroomStudentsInfo";
import getClassroomSectionStudentsInfo from "../controller/classRoomSection/getClassroomSectionStudentInfo";


const router = Express.Router();


router.get("/", getClassrooms) // Get All classrooms
router.post("/", createClassroom) // Create a new classroom
router.get("/:classroomId", getClassroom)
router.put("/:classroomId", updateClassroom)
router.delete("/:classroomId", deleteClassroom)
router.get("/:classroomId/students", getClassroomStudentsInfo)

// SECTION classroom Section
router.get("/:classroomId/class-section", getClassSections) // Get All sections
router.post("/:classroomId/class-section", createClassSection) // Create a new section
router.put("/:classroomId/class-section/:classroomSectionId", updateSection)
router.delete("/:classroomId/class-section/:classroomSectionId", deleteSection)

router.get("/:classroomId/class-section/:classroomSectionId/students", getClassroomSectionStudentsInfo)



export default router;