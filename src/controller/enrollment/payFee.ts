import Joi from "joi";
import Express from "express";
import joiValidator from "../../middleware/joiValidator";
import sequelize from "../../lib/seq";
import logger from "../../lib/logger";
import StudentMonthlyFee from "../../models/studentMonthlyFeeModel";
import ResponseErr from "../../error/responseErr";
import StudentEnrollment from "../../models/studentEnrollment";
import Student from "../../models/student";
import FeePayment from "../../models/feePayment";
import generateUUID from "../../utils/uuidGenerator";


type payFeeReqBody = {
    paidAmount: number,
    paidOn: Date | undefined,
}

type payFeeReqParams = {
    studentId: string,
    enrollmentId: string
}


const payFeeReqBodySchema = Joi.object<payFeeReqBody>({
    paidAmount: Joi.number().required(),
    paidOn: Joi.date().optional(),
})

const payFeeReqParamsSchema = Joi.object<payFeeReqParams>({
    studentId: Joi.string().required(),
    enrollmentId: Joi.string().required(),
})


export default async function payFee(req:Express.Request, res:Express.Response, next:Express.NextFunction) {

    const error = joiValidator(payFeeReqBodySchema, "body", req, res)
    if (error) {
        next(error)
        return
    }

    const paramsError = joiValidator(payFeeReqParamsSchema, "params", req, res)
    if (paramsError) {
        next(paramsError)
        return
    }


    const { studentId, enrollmentId } = req.params
    const { paidAmount, paidOn } : payFeeReqBody = req.body

    const transaction = await sequelize.transaction()

    try {

        /*
        * 1. Fetch Fee
        * 2. Fetch enrollment
        * 3. Check if enrollment is complete
        * 4. Fetch student
        * 5. Validate student
        * 6. Pay Fee
        * */


        const enrollmentData = await StudentEnrollment.findByPk(enrollmentId,
            {include: [StudentMonthlyFee] , transaction})
        if (!enrollmentData) {
            await transaction.rollback();
            next(new ResponseErr(404, "Enrollment Not Found", "The provided enrollment id does not exist."))
            return
        }

        if (enrollmentData.isComplete) {
            await transaction.rollback();
            next(new ResponseErr(409, "Enrollment is Complete. Cannot make changes", `Since enrollment is complete, it is archived.
            You can update the enrollment status to active to make changes.`))
            return
        }

        const studentData = await Student.findByPk(studentId, {transaction})
        if (!studentData) {
            await transaction.rollback();
            next(new ResponseErr(404, "Student Not Found", "The provided student id does not exist."))
            return
        }

        if (!studentData.isActive) {
            await transaction.rollback();
            next(new ResponseErr(400, "Student is Disabled", "The provided student is disabled. Please activate it first if needed."))
            return
        }

        // Now pay the Fees
        const allMonthlyFees = enrollmentData.monthlyFees

        let remainingPayment = paidAmount;

        // Sort fees by due date ascending (earlier fees get paid first)
        const sortedFees = allMonthlyFees.sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );

        const originalRemainingBalance = sortedFees.reduce((total, fee) => {
        // Only sum fees with a positive balance
        return total + (fee.balance > 0 ? fee.balance : 0);
        }, 0);


        for (const fee of sortedFees) {
          // If there is no balance left in this fee, skip processing it
          if (fee.balance <= 0) continue;

          // If the remaining payment covers the full balance of the fee
          if (remainingPayment >= fee.balance) {
            remainingPayment -= fee.balance;
            fee.amountPaid += fee.balance;
            fee.balance = 0;
            // Mark fee as fully paid (set paidDate)
            fee.paidDate = paidOn ? paidOn : new Date();
          } else {
            // If the paid amount is less than the fee balance, pay partially
            fee.amountPaid += remainingPayment;
            fee.balance -= remainingPayment;
            remainingPayment = 0;
          }
          // Save changes to the fee within the transaction scope
          await fee.save({ transaction });

          if (remainingPayment <= 0) break;
        }

        // After processing all fees, check if there is any leftover amount.
        // If so, it is an overpayment.
        if (remainingPayment > 0) {
          await transaction.rollback();
          next(
            new ResponseErr(
              400,
              "Overpayment Error",
              "The paid amount exceeds the total due fees."
            )
          );
          return
        }


        // Below this point, Fee is completely settled and we can create a payment receipt

        const remainingBalance = allMonthlyFees.reduce((acc, fee) => acc + fee.balance, 0);


        const paymentReceipt = await FeePayment.create({
            id: `payment_${generateUUID()}`,
            studentId,
            enrollmentId,
            paidAmount,
            paidOn: new Date(),
            remainingBalance: remainingBalance,
            originalBalance: originalRemainingBalance,
        }, {transaction})

        await transaction.commit()

        res.status(200).json({
            message: "Fee Paid Successfully",
            paymentReceipt,
        })
        return


    }

    catch (e) {
        await transaction.rollback();
        logger.error("Failed to Pay Fee",{studentId, enrollmentId, paidAmount}, e)
        next(e)
    }



}