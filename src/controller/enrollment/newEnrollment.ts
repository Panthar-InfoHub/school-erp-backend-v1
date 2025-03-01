import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import Student from "../../models/student";
import ClassSection from "../../models/classSections";
import ResponseErr from "../../error/responseErr";
import ClassRoom from "../../models/classRoom";
import generateUUID from "../../utils/uuidGenerator";
import StudentEnrollment from "../../models/studentEnrollment";
import logger from "../../lib/logger";
import {getFirstDateOfMonth} from "../../utils/getFirstDateOfMonth";
import {Op} from "sequelize";

type enrollmentReqParams = {
    studentId: string,
}


type enrollmentReqBody = {
    classRoomSectionId: string,
    sessionStartDate: Date,
    sessionEndDate: Date,
    monthlyFee: number,
    isActive: boolean,
}

const enrollmentReqBodySchema = Joi.object<enrollmentReqBody>({
    sessionStartDate: Joi.date().required(),
    sessionEndDate: Joi.date().required(),
    monthlyFee: Joi.number().required(),
    isActive: Joi.boolean().required(),
    classRoomSectionId: Joi.string().pattern(/^section_/).required(),
})

const enrollmentParamsSchema = Joi.object<enrollmentReqParams>({
    studentId: Joi.string().pattern(/^stu_/).required(),
})

// Helper function to calculate the difference in months between two dates
function getMonthDifference(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}


export default async function createNewEnrollment(req: Express.Request, res: Express.Response, next:Express.NextFunction) {


    const error = joiValidator(enrollmentReqBodySchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const paramsError = joiValidator(enrollmentParamsSchema, "params", req, res)
    if (paramsError) {
        next(paramsError)
        return
    }


    const body: enrollmentReqBody = req.body;
    const { studentId } = req.params;
    logger.info({ body : JSON.stringify(body), params:  req.params})

    /* Steps:
    * 1. Start transaction
    * 2. Check if the student and classroom section exists.
    * 3. Create a new entry
    * 4. Commit changes to the database
    * */

    // Normalize the session dates
    const newSessionStart = getFirstDateOfMonth(body.sessionStartDate);
    const newSessionEnd = getFirstDateOfMonth(body.sessionEndDate);

    const transaction = await sequelize.transaction();




    try {
        const studentData = await Student.findByPk(studentId, { transaction });

        if (!studentData) {
            await transaction.rollback();
            next(new ResponseErr(404, "Student Not Found", "The provided student id does not exist."))
            return;
        }


        const classSectionData = await ClassSection.findByPk(body.classRoomSectionId,
            {   include: [ClassRoom], transaction });
        if (!classSectionData) {
            await transaction.rollback();
            next(new ResponseErr(404, "Classroom Section Not Found", "The provided classroom section id does not exist."))
            return
        }

        // If the classroom is disabled
        if (!classSectionData.classRoom.isActive) {
            await transaction.rollback();
            next(new ResponseErr(400, "Classroom Not Active", "The provided classroom is not active. Please activate it first."))
            return
        }

        // if the section is disabled!
        if (!classSectionData.isActive) {
            await transaction.rollback();
            next(new ResponseErr(400, "Classroom Section Not Active", "The provided classroom section is not active. Please activate it first."))
            return
        }

        const overlappingEnrollments = await StudentEnrollment.findAll({
            where: {
                studentId,
                classroomSectionId: body.classRoomSectionId,
        // Overlap condition: existing.sessionStart < newSessionEnd AND existing.sessionEnd > newSessionStart
                sessionStart: { [Op.lt]: newSessionEnd },
                sessionEnd: { [Op.gt]: newSessionStart },
            },
            transaction,
        });

        // Check the overlapping period for each enrollment
    for (const enrollment of overlappingEnrollments) {
      // Calculate the overlap interval
        const overlapStart = enrollment.sessionStart > newSessionStart ? enrollment.sessionStart : newSessionStart;
        const overlapEnd = enrollment.sessionEnd < newSessionEnd ? enrollment.sessionEnd : newSessionEnd;
        const overlapMonths = getMonthDifference(overlapStart, overlapEnd);

        if (overlapMonths >= 2) {
            await transaction.rollback();
            next(new ResponseErr(
                409,
                "Enrollment Overlap",
                "Cannot create enrollment that overlaps with an existing enrollment for two or more months."
          ));
            return
        }
    }



        const newEnrollmentId = `enrollment_${generateUUID()}`

        const newEnrollment = await StudentEnrollment.create({
            id: newEnrollmentId,
            studentId: studentId,
            classroomSectionId: body.classRoomSectionId,
            sessionStart: getFirstDateOfMonth(body.sessionStartDate),
            sessionEnd: getFirstDateOfMonth(body.sessionEndDate),
            monthlyFee: body.monthlyFee,
            isActive: body.isActive,
            subjects: classSectionData.subjects,
        }, {transaction})

        await transaction.commit()

        res.status(200).json({
            message: "Enrollment created successfully",
            enrollmentData: newEnrollment,
        })

    }

    catch (e) {
        logger.error("Failed to create new Enrollment" , e)
        await transaction.rollback();
        next(e)
        return
    }


}