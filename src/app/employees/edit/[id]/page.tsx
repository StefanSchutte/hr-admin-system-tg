"use client";

import { api } from "~/trpc/react";
import EmployeeCreateEdit from "~/components/employees/EmployeeCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

export default function EmployeeEditPage({ params }: { params: { id: string } }) {
    const { data: employee, isLoading } = api.employee.getById.useQuery(params.id);

    if (isLoading) {
        return <Loader />;
    }

    if (!employee) {
        notFound();
    }

    // Create a properly typed employee object that matches the expected props
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