"use client";

import { api } from "~/trpc/react";
import DepartmentCreateEdit from "~/components/departments/DepartmentCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";
import { use } from "react";

export default function DepartmentEditPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {

    const resolvedParams = params instanceof Promise ? use(params) : params;
    const id = resolvedParams.id;

    const { data: department, isLoading } = api.department.getById.useQuery(id);

    if (isLoading) {
        return <Loader />;
    }

    if (!department) {
        notFound();
    }

    // Create a properly typed department object that matches the expected props
    const formattedDepartment = {
        id: department.id,
        name: department.name,
        managerId: department.managerId,
        status: department.status as "ACTIVE" | "INACTIVE" | undefined
    };

    return <DepartmentCreateEdit existingDepartment={formattedDepartment} />;
}