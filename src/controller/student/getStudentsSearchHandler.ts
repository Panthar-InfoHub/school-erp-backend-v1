// getSearchStudents.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Op, literal, fn, col, where } from "sequelize";
import joiValidator from "../../middleware/joiValidator";
import logger from "../../lib/logger";
import Student from "../../models/student";

const searchStudentsQuerySchema = Joi.object({
  q: Joi.optional().required(),
  page: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().positive().required(),
  ascending: Joi.boolean().optional(),
});

export default async function getSearchStudents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Validate query parameters
  const queryError = joiValidator(searchStudentsQuerySchema, "query", req, res);
  if (queryError) {
    next(queryError);
    return;
  }

  const q = String(req.query.q);
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const ascending = req.query.ascending === "true";
  const offset = (page - 1) * limit;

  // Convert search term to lowercase with wildcards
  const lowerSearchTerm = `%${q.toLowerCase()}%`;
  const cleanSearchTerm = lowerSearchTerm.replace(/'/g, "''");

  try {
    logger.info(`Searching students for query: ${q}, page: ${page}, limit: ${limit}`);

    // Build WHERE conditions using Sequelize.where() to convert database values to lowercase before comparing.
    const whereCondition = {
      [Op.or]: [
        where(fn("lower", col("id")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("name")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("searchName")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("address")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("fatherName")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("motherName")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("fatherPhone")), { [Op.like]: lowerSearchTerm }),
        where(fn("lower", col("motherPhone")), { [Op.like]: lowerSearchTerm }),
        // Search in the "ids" JSON array for any element where idDocValue matches the search term
        where(
          literal(`EXISTS (
            SELECT 1 FROM jsonb_array_elements("ids"::jsonb) AS elem
            WHERE lower(elem->>'idDocValue') LIKE '${cleanSearchTerm}'
          )`),
          true
        ),
      ],
    };

    // Modify the ordering clause to use lower() on the columns.
    const orderPriority = literal(`
      CASE
        WHEN lower("name") LIKE '${cleanSearchTerm}' THEN 0
        WHEN lower("fatherName") LIKE '${cleanSearchTerm}' THEN 0
        WHEN lower("motherName") LIKE '${cleanSearchTerm}' THEN 0
        ELSE 1
      END
    `);

    const { rows: students, count } = await Student.findAndCountAll({
      where: whereCondition,
      order: [
        [orderPriority, ascending ? "ASC" : "DESC"],
        ["name", ascending ? "ASC" : "DESC"],
      ],
      offset,
      limit,
    });

    logger.info(`Found ${students.length} student(s) for query: ${q}`);

    res.status(200).json({
      message: "Students fetched successfully",
      total: count,
      page,
      limit,
      students,
    });
    return;
  } catch (err) {
    logger.error("Error occurred while searching for students", err);
    next(err);
    return;
  }
}