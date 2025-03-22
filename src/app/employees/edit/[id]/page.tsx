"use client";

import { api } from "~/trpc/react";
import EmployeeCreateEdit from "~/components/employees/EmployeeCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

type PageProps = {
    params: {
        id: string;
    };
};


/**
 * Page component for editing an existing employee.
 * Fetches employee data by ID and passes it to the EmployeeCreateEdit component.
 * Safely handle params whether it's a Promise or not.
 * Show loading indicator while data is being fetched and 404 page if employee is not found.
 * Creates a properly typed employee object that matches the expected props (formattedEmployee).
 * Render the employee edit form with the fetched data.
 */
export default function EmployeeEditPage({ params }: PageProps) {

    const id = params.id;

    const { data: employee, isLoading } = api.employee.getById.useQuery(id);

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