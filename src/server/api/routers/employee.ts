import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hash } from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

function handlePrismaError(error: unknown): never {
    // Handle the unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            // Check if the constraint violation is on the emailAddress field
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

export const employeeRouter = createTRPCRouter({

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

            // Base query conditions
            const whereConditions: Prisma.EmployeeWhereInput = {};

            // Add status filter if not ALL
            if (status !== "ALL") {
                whereConditions.status = status;
            }

            // Role-based access control
            if (session.user.role === "EMPLOYEE") {
                // Regular employees can only see their own data
                whereConditions.id = session.user.employeeId;
            } else if (session.user.role === "MANAGER") {
                // Managers can see themselves and their subordinates
                if (managerId) {
                    // If a specific manager filter is applied, respect it
                    whereConditions.managerId = managerId;
                } else {
                    // Otherwise show only their team
                    whereConditions.OR = [
                        { id: session.user.employeeId },
                        { managerId: session.user.employeeId }
                    ];
                }
            } else {
                // Admins - apply any manager filter if provided
                if (managerId) {
                    whereConditions.managerId = managerId;
                }
            }

            // For department filtering, we need a different approach since it's a many-to-many relationship
            if (departmentId) {
                return ctx.db.employee.findMany({
                    where: {
                        ...whereConditions,
                        OR: [
                            // Employees directly associated with the department
                            {
                                departments: {
                                    some: {
                                        departmentId: departmentId
                                    }
                                }
                            },
                            // Employees who are managers of the department
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

            // Query with the constructed conditions
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

            // Role-based access control
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
                // Hash the default password
                const hashedPassword = await hash("Password123#", 10);

                // Create employee and user in a transaction
                return await ctx.db.$transaction(async (tx) => {
                    // Create employee first
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

                    // Create associated user
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
                // Get the employee to update
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
                    session.user.role === "ADMIN" || // Admins can access any employee
                    session.user.employeeId === id || // Users can access their own data
                    (session.user.role === "MANAGER" && session.user.employeeId === employee.managerId); // Managers can access their subordinates

                if (!isAuthorized) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Unauthorized operation"
                    });
                }

                // Build update data - basic fields that anyone can update
                const updateData: Prisma.EmployeeUpdateInput = {
                    firstName,
                    lastName,
                    telephoneNumber,
                    emailAddress,
                };

                // Only ADMIN can update status and manager
                if (session.user.role === "ADMIN") {
                    if (managerId !== undefined) {
                        updateData.manager = managerId ? { connect: { id: managerId } } : { disconnect: true };
                    }
                    if (status !== undefined) {
                        updateData.status = status;
                    }
                }

                // Update employee
                const updatedEmployee = await ctx.db.employee.update({
                    where: { id },
                    data: updateData,
                });

                // Update associated user if exists
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

    toggleStatus: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(["ACTIVE", "INACTIVE"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, status } = input;

            // Only ADMIN can toggle status
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

    getManagers: protectedProcedure
        .query(async ({ ctx }) => {
            // Only return active employees who:
            // 1. Are assigned as managers to other employees, OR
            // 2. Have a MANAGER or ADMIN role in the user table, OR
            // 3. Manage at least one department
            return ctx.db.employee.findMany({
                where: {
                    OR: [
                        // Employees who manage other employees
                        {
                            subordinates: {
                                some: {} // Has at least one subordinate
                            }
                        },
                        // Employees with manager/admin role
                        {
                            user: {
                                role: {
                                    in: ["MANAGER", "ADMIN"]
                                }
                            }
                        },
                        // Employees who manage departments
                        {
                            managedDepartments: {
                                some: {} // Manages at least one department
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

    getAllForDepartmentManager: protectedProcedure
        .query(async ({ ctx }) => {
            // Return all active employees for department manager selection
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