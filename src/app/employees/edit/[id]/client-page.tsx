"use client";

import { Suspense, lazy } from "react";
import { api } from "~/trpc/react";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

const EmployeeCreateEdit = lazy(() => import("~/components/employees/EmployeeCreateEdit"));

/**
 * Client Component for editing an existing employee.
 * Handles data fetching, loading states, and renders the employee edit form.
 * Uses React.lazy and Suspense for better component loading.
 * @param props - Component props containing the employee ID
 * @returns Employee edit form or loading/error states
 */
export default function EmployeeClientPage({ employeeId }: { employeeId: string }) {
    const { data: employee, isLoading } = api.employee.getById.useQuery(employeeId);

    if (isLoading) {
        return <Loader />;
    }

    if (!employee) {
        notFound();
    }

    const formattedEmployee = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        telephoneNumber: employee.telephoneNumber,
        emailAddress: employee.emailAddress,
        managerId: employee.managerId,
        status: employee.status as "ACTIVE" | "INACTIVE" | undefined
    };

    return (
        <Suspense fallback={<Loader />}>
            <EmployeeCreateEdit existingEmployee={formattedEmployee} />
        </Suspense>
    );
}