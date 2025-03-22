import { z } from "zod";

/**
 * Zod validation schema for employee form data.
 * Defines validation rules for employee personal information, contact details, and status.
 * First name - required with minimum length of 1.
 * Last name - required with minimum length of 1
 * Telephone number - must contain only digits.
 * Email address - must be a valid email format
 * Manager ID - optional reference to another employee.
 * Employee status - optional enum with default value of "ACTIVE"
 */
export const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    telephoneNumber: z.string().regex(/^\d+$/, "Must contain only digits"),
    emailAddress: z.string().email("Valid email is required"),
    managerId: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

/**
 * Zod validation schema for department form data
 * Defines validation rules for department name, manager assignment, and status.
 * Department name - required with minimum length of 1
 * Manager ID - required with minimum length of 1.
 * Department status - optional enum with default value of "ACTIVE"
 */
export const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    managerId: z.string().min(1, "Manager is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

/**
 * Zod validation schema for login form.
 * Defines validation rules for email and password fields.
 * Email address field - must be a valid email format.
 * Password field - required with minimum length of 1.
 */
export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(1, { message: "Password is required" }),
});