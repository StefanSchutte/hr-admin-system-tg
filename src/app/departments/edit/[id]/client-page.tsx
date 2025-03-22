"use client";

import { api } from "~/trpc/react";
import DepartmentCreateEdit from "~/components/departments/DepartmentCreateEdit";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

/**
 * Client Component for editing an existing department.
 * Handles data fetching, loading states, and renders the department edit form.
 * - Fetching department data using tRPC
 * - Showing loading states while data is being fetched
 * - Showing a 404 page if the department doesn't exist
 * - Formatting department data for the form component
 * - Rendering the DepartmentCreateEdit form with the fetched data
 * @param props - Component props containing the department ID
 * @returns Department edit form or loading/error states
 */
export default function DepartmentClientPage({ departmentId }: { departmentId: string }) {
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