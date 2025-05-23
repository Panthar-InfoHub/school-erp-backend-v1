// loginEmployee.ts
import Express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Employee from "../../models/employee";
import Admin from "../../models/admin";
import Teacher from "../../models/teacher";
import joiValidator from "../../middleware/joiValidator";

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginEmployee = async (req: Express.Request, res: Express.Response, next:Express.NextFunction) => {
    // Validate the request body using Joi
    const error = joiValidator(loginSchema, "body", req, res);
    if (error) {
        next(error);
        return
    }

    const { email, password } = req.body;

    try {
        // Find the employee by email, including their related records to determine roles
        const employee = await Employee.findOne({
            where: { email },
            include: [Admin, Teacher],
        });

        if (!employee) {
            res.status(401).json({ error: "Invalid credentials." });
            return
        }

        // Compare the provided password with the stored hash using bcrypt
        const passwordMatch = await bcrypt.compare(password, employee.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ error: "Invalid credentials." });
            return
        }

        // Determine employee roles based on the existence of related records
        const isAdmin = Boolean(employee.admin);
        const isTeacher = Boolean(employee.teacherData);
        
        // Prepare the payload for the JWT
        const payload = {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            isAdmin,
            isTeacher,
        };

        // Sign the JWT. The secret should be provided via environment variables.
        const token = jwt.sign(payload, process.env.JWT_SECRET || email, { // Sign token with email of user
            expiresIn: "24h",
        });

        res.json({ message: "Login successful", token });

        return
    } catch (err) {
        console.error("Error in employee login:", err);
        next(err)
        return
    }
};

export default loginEmployee;