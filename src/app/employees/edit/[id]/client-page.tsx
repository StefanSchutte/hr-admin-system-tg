"use client";

import { api } from "~/trpc/react";
import EmployeeCreateEdit from "~/components/employees/EmployeeCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

/**
 * Client Component for editing an existing employee.
 * Handles data fetching, loading states, and renders the employee edit form.
 * - Fetching employee data using tRPC
 * - Showing loading states while data is being fetched
 * - Showing a 404 page if the employee doesn't exist
 * - Formatting employee data for the form component
 * - Rendering the EmployeeCreateEdit form with the fetched data
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

    return <EmployeeCreateEdit existingEmployee={formattedEmployee} />;
}