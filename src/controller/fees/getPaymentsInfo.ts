import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import joiValidator from "../../middleware/joiValidator";
import FeePayment from "../../models/feePayment";
import { Op } from "sequelize";

type getPaymentsInfoQuery = {
  start_date: Date;
  end_date: Date;
  limit: number;
  page: number;
  ascending: boolean;
}

const getPaymentsInfoQuerySchema = Joi.object<getPaymentsInfoQuery>({
  start_date: Joi.date().required(),
  end_date: Joi.date().optional(),
  page: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().positive().required(),
  ascending: Joi.boolean().optional(),

});

export default async function getPaymentsInfo(req: Request, res: Response, next: NextFunction) {
  
  const error = joiValidator(getPaymentsInfoQuerySchema, "query", req, res);
  if (error) {
    next(error);
    return;
  }
  
  try {
    
    let { start_date, end_date, page, limit, ascending } = req.query;
    
    const zeroTimedStartDate = new Date(new Date(start_date as string).setHours(0, 0, 0, 0));
    const zeroTimedEndDate = new Date(new Date(end_date as string).setHours(0, 0, 0, 0));
    
    console.log({ zeroTimedStartDate, zeroTimedEndDate })
    
    const {rows : payments , count} = await FeePayment.findAndCountAll({
      where: {
        paidOn : {
          [Op.between]: [zeroTimedStartDate, zeroTimedEndDate]
        },
      },
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['paidOn', ascending === "true" ? 'ASC' : 'DESC']]

    })
    
    console.log(`Length of Payments: ${payments.length}`)
    
    res.status(200).json({
      message: "Payments fetched successfully",
      payments,
      count,
    });
    
  }
  catch (error) {
    next(error);
    return;
  }
  
}