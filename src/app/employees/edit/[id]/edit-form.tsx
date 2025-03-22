"use client";
// src/app/employees/edit/[id]/edit-form.tsx

import { api } from "~/trpc/react";
import EmployeeCreateEdit from "~/components/employees/EmployeeCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

interface EditFormProps {
    employeeId: string;
}

export default function EmployeeEditForm({ employeeId }: EditFormProps) {
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