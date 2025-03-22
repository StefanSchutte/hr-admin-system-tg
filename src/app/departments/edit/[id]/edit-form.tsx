"use client";
// src/app/departments/edit/[id]/edit-form.tsx

import { api } from "~/trpc/react";
import DepartmentCreateEdit from "~/components/departments/DepartmentCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

interface EditFormProps {
    departmentId: string;
}

export default function DepartmentEditForm({ departmentId }: EditFormProps) {
    const { data: department, isLoading } = api.department.getById.useQuery(departmentId);

    if (isLoading) {
        return <Loader />;
    }

    if (!department) {
        notFound();
    }

    const formattedDepartment = {
        id: department.id,
        name: department.name,
        managerId: department.managerId,
        status: department.status as "ACTIVE" | "INACTIVE" | undefined
    };

    return <DepartmentCreateEdit existingDepartment={formattedDepartment} />;
}