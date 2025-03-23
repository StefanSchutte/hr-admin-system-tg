"use client";

import { Suspense, lazy } from "react";
import { api } from "~/trpc/react";
import { notFound } from "next/navigation";
import Loader from "~/components/ui/Loader";

const DepartmentCreateEdit = lazy(() => import("~/components/departments/DepartmentCreateEdit"));

/**
 * Client Component for editing an existing department.
 * Handles data fetching, loading states, and renders the department edit form.
 * Uses React.lazy and Suspense for better component loading.
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

    return (
        <Suspense fallback={<Loader />}>
            <DepartmentCreateEdit existingDepartment={formattedDepartment} />
        </Suspense>
    );
}