import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import StudentEnrollment from "../../models/studentEnrollment";
import Student from "../../models/student";
import ResponseErr from "../../error/responseErr";
import ExamEntry from "../../models/examEntry";
import generateUUID from "../../utils/uuidGenerator";
import {subjectResult} from "../../types";

type createExamEntryReqBody = {
    examName: string
    examType: string
    examDate: Date,
    note: string | undefined,
}


type createExamEntryReqParams = {
    studentId: string,
    enrollmentId: string
}

const createExamEntryReqBodySchema = Joi.object<createExamEntryReqBody>({
    examName: Joi.string().required(),
    examType: Joi.string().required(),
    examDate: Joi.date().required(),
    note: Joi.string().allow("").optional(),
})

const createExamEntryReqParamsSchema = Joi.object<createExamEntryReqParams>({
    enrollmentId: Joi.string().required(),
    studentId: Joi.string().required(),
})

export default async function createExamEntry(req: Request, res: Response, next: NextFunction) {

    const error = joiValidator(createExamEntryReqBodySchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const paramsError = joiValidator(createExamEntryReqParamsSchema, "params", req, res)
    if (paramsError) {
        next(paramsError)
        return
    }

    const { enrollmentId } = req.params
    const { examName, examType, examDate, note } : createExamEntryReqBody = req.body


    try {
        // check if enrollment exists and active
        const enrollmentData = await StudentEnrollment.findByPk(enrollmentId, {
            include: [Student]
        })

        if (!enrollmentData) {
            next(new ResponseErr(404, "Enrollment Not Found", "The provided enrollment id does not exist."))
            return
        }

        if (!enrollmentData.isActive) {
            next(new ResponseErr(400, "Enrollment is not active", "The provided enrollment is not active."))
            return
        }

        if (enrollmentData.isComplete) {
            next(new ResponseErr(409, "Enrollment is already complete", "The provided enrollment is already complete."))
            return
        }

        // check student
        if (!enrollmentData.student) {
            next(new ResponseErr(404, "Student Not Found", "The provided enrollment does not have a student assigned to it."))
            return
        }

        if (!enrollmentData.student.isActive) {
            next(new ResponseErr(400, "Student is not active", "The provided student is not active."))
            return
        }

        // add exam

        const subjectResults: subjectResult[] = enrollmentData.subjects.map(subject => {
            const newObj: subjectResult = {
                name: subject.name,
                code: subject.code,
                theoryExam: subject.theoryExam,
                practicalExam: subject.practicalExam,
                obtainedMarksPractical: null,
                obtainedMarksTheory: null,
                totalMarksTheory: null,
                totalMarksPractical: null,
                totalMarks: null
            }
            return newObj
        })



        const examEntry = await ExamEntry.create({
            examEntryId: `exam_entry_${generateUUID()}`,
            examName,
            studentId: enrollmentData.studentId,
            enrollmentId: enrollmentId,
            studentPassed: true,
            subjects: subjectResults,
            note,
            examType,
            examDate,
        })

        res.status(200).json({
            message: "Exam entry created successfully",
            examEntryData: examEntry,
        })

    }
    catch (e) {
        if (e instanceof Error) {
            if (e.name === "SequelizeUniqueConstraintError") {
                next(new ResponseErr(409, "Exam names and Dates must be unique.",
                    "Exam names and Dates must be unique."))
                return
            }

        }
        next(e)
        return
    }



}