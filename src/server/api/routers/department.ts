// src/server/api/routers/department.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";


export const departmentRouter = createTRPCRouter({

    getAll: protectedProcedure
        .input(
            z.object({
                status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { status } = input;
            const { session } = ctx;

            // Base query conditions
            const whereConditions: Prisma.DepartmentWhereInput = {};

            // Add status filter if not ALL
            if (status !== "ALL") {
                whereConditions.status = status;
            }

            // Role-based access control
            if (session.user.role === "EMPLOYEE") {
                // Regular employees should only see departments they belong to
                whereConditions.employees = {
                    some: {
                        employeeId: session.user.employeeId
                    }
                };
            } else if (session.user.role === "MANAGER") {
                // Managers can see departments they manage or belong to
                whereConditions.OR = [
                    { managerId: session.user.employeeId }, // Departments they manage
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

            // Only ADMIN can create departments
            if (session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized operation"
                });
            }

            try {
                return await ctx.db.$transaction(async (tx) => {
                    // Create the department
                    const department = await tx.department.create({
                        data: {
                            name,
                            status,
                            managerId,
                        },
                    });

                    // Find the user associated with the employee
                    const userToUpdate = await tx.user.findFirst({
                        where: { employeeId: managerId }
                    });

                    // Update the user's role to MANAGER if they're currently an EMPLOYEE
                    if (userToUpdate && userToUpdate.role === "EMPLOYEE") {
                        await tx.user.update({
                            where: { id: userToUpdate.id },
                            data: { role: "MANAGER" }
                        });
                    }

                    return department;
                });
            } catch (error) {
                // Handle the unique constraint violation
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'Department name already exists'
                        });
                    }
                }
                // Re-throw other errors
                throw error;
            }
            }),

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

            // Only ADMIN can update departments
            if (session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Unauthorized operation"
                });
            }

            try {
                return await ctx.db.$transaction(async (tx) => {
                    // Get current department to check if manager is changing
                    const currentDept = await tx.department.findUnique({
                        where: { id }
                    });

                    if (!currentDept) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Department not found"
                        });
                    }

                    // Build update data
                    const updateData: Prisma.DepartmentUpdateInput = {
                        name,
                        manager: {
                            connect: { id: managerId }
                        }
                    };

                    if (status !== undefined) {
                        updateData.status = status;
                    }

                    // Update the department
                    const department = await tx.department.update({
                        where: { id },
                        data: updateData,
                    });

                    // If manager changed, update user roles
                    if (currentDept && currentDept.managerId !== managerId) {
                        // Update new manager's role to MANAGER
                        const newManagerUser = await tx.user.findFirst({
                            where: { employeeId: managerId }
                        });

                        if (newManagerUser && newManagerUser.role === "EMPLOYEE") {
                            await tx.user.update({
                                where: { id: newManagerUser.id },
                                data: { role: "MANAGER" }
                            });
                        }

                        // Check if previous manager should revert to EMPLOYEE role
                        // Only if they don't manage other departments or employees
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
                // Handle the unique constraint violation
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'Department name already exists'
                        });
                    }
                }
                // Re-throw other errors
                throw error;
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

            return ctx.db.department.update({
                where: { id },
                data: { status },
            });
        }),
});