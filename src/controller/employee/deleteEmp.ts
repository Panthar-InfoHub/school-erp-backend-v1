import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import ResponseErr from "../../error/responseErr";


type deleteImpReqParams = {
    employeeId: string
}

const deleteEmpReqParamsSchema = Joi.object<deleteImpReqParams>({
    employeeId: Joi.string().required()
})


export default async function deleteEmp(req: Express.Request, res: Express.Response, next:Express.NextFunction) {

    const error = joiValidator(deleteEmpReqParamsSchema, "params", req, res)
    if (error) {
        next(error)
        return
    }

    const employeeId = req.params.employeeId

    try {

        const destroyedCount = await Employee.destroy({where: {id: employeeId}})
        if (destroyedCount === 0) {
            next(new ResponseErr(
                 404,
                 "Could not delete the employee",
                 "The identifying field did not result a successful search."))
            return
        }
        res.status(200).json({
            message: "Employee Deleted Successfully",
            destroyedCount,
        })


    }
    catch (e) {
        next(e)
    }

}