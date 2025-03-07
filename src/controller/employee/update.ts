import Express from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import Employee from "../../models/employee";
import ResponseErr from "../../error/responseErr";
import bcrypt from "bcrypt";
import Teacher from "../../models/teacher";
import Driver from "../../models/driver";
import sequelize from "../../lib/seq";
import {identityEntry} from "../../types";

type updateEmpReqParams = {
	employeeId: string
}

const updateEmpReqParamsSchema = Joi.object<updateEmpReqParams>({
	employeeId: Joi.string().required()
})

type updateEmpReqBody = {
	passwordHash: string | undefined, // Used as a helper in updating password
	name: string | undefined,
	password: string | undefined,
	address: string | undefined
	fatherName: string | undefined,
	fatherPhone: string | undefined,
	motherName: string | undefined,
	motherPhone: string | undefined,
	dateOfBirth: Date | undefined,
	workRole: string | undefined,
	salary: number | undefined,
	email: string | undefined,
	phone: string | undefined,
	isActive: boolean | undefined,
	isFired: boolean | undefined,
	ids?: Array<identityEntry>,
}

const updateEmpReqBodySchema = Joi.object<updateEmpReqBody>({
	name: Joi.string().allow('').optional(),
	password: Joi.string().allow('').optional(),
	address: Joi.string().allow('').optional(),
	fatherName: Joi.string().allow('').optional(),
	fatherPhone: Joi.string().allow('').optional(),
	motherName: Joi.string().allow('').optional(),
	motherPhone: Joi.string().allow('').optional(),
	dateOfBirth: Joi.date().allow('').optional(),
	workRole: Joi.string().allow('').optional(),
	salary: Joi.number().allow('').optional(),
	email: Joi.string().allow('').optional(),
	phone: Joi.string().allow('').optional(),
	isActive: Joi.boolean().allow('').optional(),
	isFired: Joi.boolean().allow('').optional(),
	ids: Joi.array()
		.items(
			Joi.object({
				idDocName: Joi.string().required(),
				idDocValue: Joi.string().required(),
			})
		)
		.optional(),
}).custom((value, helpers) => {
	if (Object.values(value).every((field) => field === undefined)) {
		return helpers.error("any.custom", {message: "All fields cannot be undefined"});
	}
	return value;
});

export default async function updateEmployee(req:Express.Request, res:Express.Response, next:Express.NextFunction) {
	
	const paramsErr = joiValidator(updateEmpReqParamsSchema, "params", req, res)
	if (paramsErr) {
		next(paramsErr)
		return
	}
	
	const bodyErr = joiValidator(updateEmpReqBodySchema, "body", req, res)
	if (bodyErr) {
		next(bodyErr)
		return
	}
	
	const empId = req.params.employeeId
	const body : updateEmpReqBody = req.body;
	
	const transaction = await sequelize.transaction()
	
	/*
	* We need to update the key "passwordHash". We could use a variable, but this is simpler.
	* We're adding the key in the body of our request directly and spreading the body it in try block.
	* */
	if (body.password) {
		body.passwordHash = bcrypt.hashSync(body.password, 10)
	}
	
	try {
		
		const empData = await Employee.findByPk(empId)
		if (!empData) {
			await transaction.rollback()
			next(new ResponseErr(
				404,
				"Could not update the employee details",
				"The identifying field did not result a successful search."
			))
			return
		}
		
		
		/*
		* Compare `workRole` in `body` and `empData`.
		* Perform specific deletion operations if the role is changed.
		*/
		if (body.workRole && body.workRole !== empData.workRole) {
			if (empData.workRole === "teacher" && body.workRole !== "teacher") {
				await Teacher.destroy({where: {id: empId}, transaction});
			}
			if (empData.workRole === "driver" && body.workRole !== "driver") {
				await Driver.destroy({where: {id: empId}, transaction});
			}
			
			if (body.workRole === "teacher") {
				await Teacher.create({id: empId}, {transaction});
			}
			if (body.workRole === "driver") {
				await Driver.create({id: empId}, {transaction});
			}
		}
		
		
		const updatedEmpData = await empData.update({...body}, {where: {id: empId}, transaction})
		
		await transaction.commit()
		
		res.status(200).json({
			message: "Employee Updated Successfully",
			employeeData: updatedEmpData,
		})
		
	}
	catch (e) {
		await transaction.rollback();
		next(e)
		return
	}
	
	
}
