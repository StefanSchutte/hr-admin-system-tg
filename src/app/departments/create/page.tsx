"use client";

import { Suspense, lazy } from "react";
import Loader from "~/components/ui/Loader";

const DepartmentCreateEdit = lazy(() => import("~/components/departments/DepartmentCreateEdit"));

/**
 * Renders the DepartmentCreateEdit component in creation mode with Suspense for better loading experience.
 * Uses React.lazy to load the form component, showing a loader while it's being loaded.
 * @returns Department creation form with loading fallback
 */
export default function DepartmentCreatePage() {
    return (
        <Suspense fallback={<Loader />}>
            <DepartmentCreateEdit />
        </Suspense>
    );
}