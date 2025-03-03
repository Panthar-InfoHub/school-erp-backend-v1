import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import ExamEntry from "../../models/examEntry";
import ResponseErr from "../../error/responseErr";


const deleteExamEntryParamsSchema = Joi.object({
    examEntryId: Joi.string().required(),
    studentId: Joi.string().required(),
    enrollmentId: Joi.string().required(),
})


export default async function deleteExamEntry(req: Request, res: Response, next: NextFunction) {

    const error = joiValidator(deleteExamEntryParamsSchema, "params", req, res)
    if (error) {
        next(error)
        return
    }

    const { examEntryId, studentId, enrollmentId } = req.params

    try {

        logger.info("Deleting exam entry with ids : ", examEntryId, studentId, enrollmentId)

        const destroyedCount = await ExamEntry.destroy({
            where: {
                examEntryId: examEntryId,
                studentId: studentId,
                enrollmentId: enrollmentId
            }
        })

        if (destroyedCount === 0) {
            next(new ResponseErr(
                  404,
                 "Could not delete the exam entry",
                 "The identifying field did not result a successful search."))
            return
        }

        res.status(200).json({
            message: "Exam entry deleted successfully",
            destroyedCount,
        })



    }
    catch (e) {
        logger.error("Failed to delete exam entry", e)
        next(e)
        return
    }




}