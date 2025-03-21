import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

/**
 * Department router for handling department-related operations.
 * - Retrieving departments with filtering and role-based access control.
 * - Getting detailed information about a specific department.
 * - Creating new departments.
 * - Updating existing departments.
 * - Toggling department status.
 */
export const departmentRouter = createTRPCRouter({

    /**
     * Get all departments based on status filter and user role.
     * This procedure:
     * - Accepts an optional status filter (ACTIVE, INACTIVE, or ALL)
     * - Implements role-based access control where:
     *   - Admins can see all departments
     *   - Managers can see departments they manage or belong to
     *   - Employees can only see departments they belong to
     * - Returns departments with their manager information
     * @param input.status - Optional status filter (ACTIVE, INACTIVE, or ALL)
     * @returns List of departments with manager information.
     */
    getAll: protectedProcedure
        .input(
            z.object({
                status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { status } = input;
            const { session } = ctx;

            const whereConditions: Prisma.DepartmentWhereInput = {};

            if (status !== "ALL") {
                whereConditions.status = status;
            }

            if (session.user.role === "EMPLOYEE") {
                whereConditions.employees = {
                    some: {
                        employeeId: session.user.employeeId
                    }
                };
            } else if (session.user.role === "MANAGER") {
                whereConditions.OR = [
                    { managerId: session.user.employeeId },
                    {
                        employees: {
                            some: {
                                employeeId: session.user.employeeId
                            }
                        }
                    }
                ];
            }

            return ctx.db.department.findMany({
                where: whereConditions,
                include: {
                    manager: true,
                },
            });
        }),

    /**
     * Get a department by ID with detailed information.
     * - Fetches a department by its unique ID.
     * - Includes manager details and all employees in the department.
     * - Throws a NOT_FOUND error if the department doesn't exist.
     * @param input - Department ID
     * @returns Department with manager and employee details
     * @throws {TRPCError} If department not found
     */
    getById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {

            const department = await ctx.db.department.findUnique({
                where: { id: input},
                include: {
                    manager: true,
                    employees: {
                        include: {
                            employee: true,
                        },
                    },
                },
            });

            if (!department) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Department not found"
                });
            }

            return department;
        }),

    /**
     * Create a new department (admin only).
     * - Validates department data with Zod schema.
     * - Enforces admin-only access control.
     * - Creates a department in a transaction.
     * - Promotes the assigned manager to MANAGER role if they're an EMPLOYEE.
     * - Handles unique constraint violations for department names.
     * @param input.name - Department name (must be unique)
     * @param input.managerId - ID of the employee who will manage the department
     * @param input.status - Department status (ACTIVE or INACTIVE)
     * @returns The newly created department
     * @throws {TRPCError} If unauthorized, department name exists, or other errors
     */
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "Name is required"),
                managerId: z.string(),
                status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { name, managerId, status } = input;
            const { session } = ctx;

            if (session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized operation"
                });
            }

            try {
                return await ctx.db.$transaction(async (tx) => {
                    const department = await tx.department.create({
                        data: {
                            name,
                            status,
                            managerId,
                        },
                    });

                    const userToUpdate = await tx.user.findFirst({
                        where: { employeeId: managerId }
                    });

                    if (userToUpdate && userToUpdate.role === "EMPLOYEE") {
                        await tx.user.update({
                            where: { id: userToUpdate.id },
                            data: { role: "MANAGER" }
                        });
                    }

                    return department;
                });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'Department name already exists'
                        });
                    }
                }
                throw error;
            }
            }),

    /**
     * Update an existing department (admin only).
     * - Validates update data with Zod schema.
     * - Enforces admin-only access control.
     * - Updates department in a transaction.
     * - Handles manager role changes:
     *   - Promotes new manager to MANAGER role if needed.
     *   - Demotes previous manager to EMPLOYEE if they no longer manage anything.
     * - Handles unique constraint violations for department names.
     * @param input.id - Department ID to update
     * @param input.name - Updated department name
     * @param input.managerId - Updated manager ID
     * @param input.status - Optional updated status
     * @returns The updated department
     * @throws {TRPCError} If unauthorized, not found, name conflict, or other errors
     */
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1, "Name is required"),
                managerId: z.string(),
                status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, name, managerId, status } = input;
            const { session } = ctx;

            if (session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized operation"
                });
            }

            try {
                return await ctx.db.$transaction(async (tx) => {

                    const currentDept = await tx.department.findUnique({
                        where: { id }
                    });

                    if (!currentDept) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Department not found"
                        });
                    }

                    const updateData: Prisma.DepartmentUpdateInput = {
                        name,
                        manager: {
                            connect: { id: managerId }
                        }
                    };

                    if (status !== undefined) {
                        updateData.status = status;
                    }

                    const department = await tx.department.update({
                        where: { id },
                        data: updateData,
                    });

                    if (currentDept && currentDept.managerId !== managerId) {

                        const newManagerUser = await tx.user.findFirst({
                            where: { employeeId: managerId }
                        });

                        if (newManagerUser && newManagerUser.role === "EMPLOYEE") {
                            await tx.user.update({
                                where: { id: newManagerUser.id },
                                data: { role: "MANAGER" }
                            });
                        }

                        if (currentDept.managerId) {
                            const stillManaging = await tx.department.findFirst({
                                where: { managerId: currentDept.managerId, NOT: { id } }
                            });

                            const hasSubordinates = await tx.employee.findFirst({
                                where: { managerId: currentDept.managerId }
                            });

                            if (!stillManaging && !hasSubordinates) {
                                const prevManagerUser = await tx.user.findFirst({
                                    where: { employeeId: currentDept.managerId }
                                });

                                if (prevManagerUser && prevManagerUser.role === "MANAGER") {
                                    await tx.user.update({
                                        where: { id: prevManagerUser.id },
                                        data: { role: "EMPLOYEE" }
                                    });
                                }
                            }
                        }
                    }

                    return department;
                });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'Department name already exists'
                        });
                    }
                }
                throw error;
            }
        }),

    /**
     * Toggle department status between ACTIVE and INACTIVE (admin only).
     * - Validates input with Zod schema.
     * - Enforces admin-only access control.
     * - Updates department status.
     * @param input.id - Department ID to update
     * @param input.status - New status (ACTIVE or INACTIVE)
     * @returns The updated department
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

            return ctx.db.department.update({
                where: { id },
                data: { status },
            });
        }),
});