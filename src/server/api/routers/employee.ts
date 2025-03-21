import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hash } from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

/**
 * Utility function to handle Prisma errors consistently.
 * Specialized error handling for Prisma constraint violations, specifically checking for email address uniqueness and converting database errors to appropriate TRPC errors.
 * @param error - The error thrown by Prisma
 * @throws {TRPCError} With appropriate error code and message
 */
function handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const target = (error.meta?.target as string[] | undefined) ?? [];
            if (target.includes('emailAddress')) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Email address already exists'
                });
            } else {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'A unique constraint violation occurred'
                });
            }
        }
    }
    throw error;
}

/**
 * Employee router for handling employee-related operations.
 * - Retrieving employees with filtering and role-based access control.
 * - Getting detailed information about a specific employee.
 * - Creating new employees with associated user accounts.
 * - Updating existing employees with proper access control.
 * - Toggling employee status.
 * - Retrieving lists of managers for various purposes.
 */
export const employeeRouter = createTRPCRouter({

    /**
     * Get all employees based on filters and user role.
     * - Accepts filters for status, manager, and department.
     * - Implements role-based access control where:
     *   - Admins can see all employees (with optional filters).
     *   - Managers can see themselves and their subordinates.
     *   - Employees can only see their own data.
     * - Handles special case for department filtering with many-to-many relationships.
     * - Returns employees with their manager and department information.
     * @param input.status - Optional status filter (ACTIVE, INACTIVE, or ALL)
     * @param input.managerId - Optional filter to show employees of a specific manager
     * @param input.departmentId - Optional filter to show employees of a specific department
     * @returns List of employees with manager and department information
     */
    getAll: protectedProcedure
        .input(
            z.object({
                status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).default("ALL"),
                managerId: z.string().optional(),
                departmentId: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { status, managerId, departmentId } = input;
            const { session } = ctx;

            const whereConditions: Prisma.EmployeeWhereInput = {};

            if (status !== "ALL") {
                whereConditions.status = status;
            }

            if (session.user.role === "EMPLOYEE") {
                whereConditions.id = session.user.employeeId;
            } else if (session.user.role === "MANAGER") {
                if (managerId) {
                    whereConditions.managerId = managerId;
                } else {
                    whereConditions.OR = [
                        { id: session.user.employeeId },
                        { managerId: session.user.employeeId }
                    ];
                }
            } else {
                if (managerId) {
                    whereConditions.managerId = managerId;
                }
            }

            if (departmentId) {
                return ctx.db.employee.findMany({
                    where: {
                        ...whereConditions,
                        OR: [
                            {
                                departments: {
                                    some: {
                                        departmentId: departmentId
                                    }
                                }
                            },
                            {
                                managedDepartments: {
                                    some: {
                                        id: departmentId
                                    }
                                }
                            }
                        ]
                    },
                    include: {
                        manager: true,
                        departments: {
                            include: {
                                department: true
                            }
                        }
                    }
                });
            }

            return ctx.db.employee.findMany({
                where: whereConditions,
                include: {
                    manager: true,
                    departments: {
                        include: {
                            department: true
                        }
                    }
                }
            });
        }),

    /**
     * Get an employee by ID with detailed information.
     * - Fetches an employee by their unique ID.
     * - Includes manager details and departments information.
     * - Implements strict role-based access control:
     *   - Employees can only access their own data.
     *   - Managers can access their own data and their direct subordinates.
     *   - Admins can access any employee data.
     * - Throws appropriate errors for not found or unauthorized access.
     * @param input - Employee ID
     * @returns Employee with manager and department details
     * @throws {TRPCError} If employee not found or access is unauthorized
     */
    getById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const { session } = ctx;

            const employee = await ctx.db.employee.findUnique({
                where: { id: input },
                include: {
                    manager: true,
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                },
            });

            if (!employee) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Employee not found"
                });
            }

            if (
                session.user.role === "EMPLOYEE" &&
                session.user.employeeId !== employee.id
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized access"
                });
            }

            if (
                session.user.role === "MANAGER" &&
                session.user.employeeId !== employee.id &&
                session.user.employeeId !== employee.managerId
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized access"
                });
            }

            return employee;
        }),

    /**
     * Create a new employee with associated user account.
     * - Validates employee data with Zod schema.
     * - Creates both an employee record and an associated user account in a transaction.
     * - Sets up default password for the new user.
     * - Handles unique constraint violations (especially for email address).
     * @param input.firstName - Employee's first name
     * @param input.lastName - Employee's last name
     * @param input.telephoneNumber - Employee's telephone number (digits only)
     * @param input.emailAddress - Employee's email address (unique)
     * @param input.managerId - Optional ID of the employee's manager
     * @param input.status - Employee status (ACTIVE or INACTIVE)
     * @returns The newly created employee
     * @throws {TRPCError} If email exists or other database errors
     */
    create: protectedProcedure
        .input(
            z.object({
                firstName: z.string().min(1, "First name is required"),
                lastName: z.string().min(1, "Last name is required"),
                telephoneNumber: z.string().regex(/^\d+$/, "Must contain only digits"),
                emailAddress: z.string().email("Valid email is required"),
                managerId: z.string().optional(),
                status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { firstName, lastName, telephoneNumber, emailAddress, managerId, status } = input;

            try {
                const hashedPassword = await hash("Password123#", 10);

                return await ctx.db.$transaction(async (tx) => {
                    const employee = await tx.employee.create({
                        data: {
                            firstName,
                            lastName,
                            telephoneNumber,
                            emailAddress,
                            status,
                            ...(managerId ? { managerId } : {}),
                        },
                    });

                    await tx.user.create({
                        data: {
                            email: emailAddress,
                            password: hashedPassword,
                            name: `${firstName} ${lastName}`,
                            role: "EMPLOYEE",
                            employeeId: employee.id,
                        }
                    });

                    return employee;
                });
            } catch (error) {
                handlePrismaError(error);
            }
        }),

    /**
     * Update an existing employee with role-based permissions.
     * - Validates update data with Zod schema.
     * - Implements fine-grained access control:
     *   - Admins can update any employee and all fields.
     *   - Users can update their own basic information.
     *   - Managers can update basic information for their subordinates.
     * - Updates both employee record and associated user account.
     * - Handles unique constraint violations.
     * @param input.id - Employee ID to update
     * @param input.firstName - Updated first name
     * @param input.lastName - Updated last name
     * @param input.telephoneNumber - Updated telephone number
     * @param input.emailAddress - Updated email address
     * @param input.managerId - Updated manager ID (admin only)
     * @param input.status - Updated status (admin only)
     * @returns The updated employee
     * @throws {TRPCError} If not found, unauthorized, email exists, or other errors
     */
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                firstName: z.string().min(1, "First name is required"),
                lastName: z.string().min(1, "Last name is required"),
                telephoneNumber: z.string().regex(/^\d+$/, "Must contain only digits"),
                emailAddress: z.string().email("Valid email is required"),
                managerId: z.string().optional(),
                status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, firstName, lastName, telephoneNumber, emailAddress, managerId, status } = input;
            const { session } = ctx;

            try {
                const employee = await ctx.db.employee.findUnique({
                    where: { id },
                    include: { user: true },
                });

                if (!employee) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Employee not found"
                    });
                }

                const isAuthorized =
                    session.user.role === "ADMIN" ||
                    session.user.employeeId === id ||
                    (session.user.role === "MANAGER" && session.user.employeeId === employee.managerId);

                if (!isAuthorized) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Unauthorized operation"
                    });
                }

                const updateData: Prisma.EmployeeUpdateInput = {
                    firstName,
                    lastName,
                    telephoneNumber,
                    emailAddress,
                };

                if (session.user.role === "ADMIN") {
                    if (managerId !== undefined) {
                        updateData.manager = managerId ? { connect: { id: managerId } } : { disconnect: true };
                    }
                    if (status !== undefined) {
                        updateData.status = status;
                    }
                }

                const updatedEmployee = await ctx.db.employee.update({
                    where: { id },
                    data: updateData,
                });

                if (employee.user) {
                    await ctx.db.user.update({
                        where: { id: employee.user.id },
                        data: {
                            email: emailAddress,
                            name: `${firstName} ${lastName}`,
                        },
                    });
                }

                return updatedEmployee;
            } catch (error) {
                handlePrismaError(error);
            }
        }),

    /**
     * Toggle employee status between ACTIVE and INACTIVE (admin only).
     * - Validates input with Zod schema.
     * - Enforces admin-only access control.
     * - Updates employee status.
     * @param input.id - Employee ID to update
     * @param input.status - New status (ACTIVE or INACTIVE)
     * @returns The updated employee
     * @throws {TRPCError} If unauthorized
     */
    toggleStatus: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(["ACTIVE", "INACTIVE"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, status } = input;

            if (ctx.session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized operation"
                });
            }

            return ctx.db.employee.update({
                where: { id },
                data: { status },
            });
        }),

    /**
     * Get all employees who are managers.
     * This procedure fetches employees who:
     * 1. Have subordinates reporting to them, OR
     * 2. Have a MANAGER or ADMIN role, OR
     * 3. Manage at least one department
     * @returns List of managers with basic information (id, firstName, lastName)
     */
    getManagers: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.employee.findMany({
                where: {
                    OR: [
                        {
                            subordinates: {
                                some: {}
                            }
                        },
                        {
                            user: {
                                role: {
                                    in: ["MANAGER", "ADMIN"]
                                }
                            }
                        },
                        {
                            managedDepartments: {
                                some: {}
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
                orderBy: {
                    firstName: "asc",
                }
            });
        }),

    /**
     * Get all active employees for department manager selection.
     * This procedure fetches all active employees for assignable manager roles, used in department manager selection dropdowns.
     * @returns List of active employees with basic information (id, firstName, lastName)
     */
    getAllForDepartmentManager: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.employee.findMany({
                where: {
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
                orderBy: {
                    firstName: "asc",
                }
            });
        }),
});