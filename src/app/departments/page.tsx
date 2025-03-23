"use client";

import { Suspense, lazy } from "react";
import Loader from "~/components/ui/Loader";

const DepartmentList = lazy(() => import("~/components/departments/DepartmentList"));

/**
 * Renders the DepartmentList component which displays all departments and provides options for department management (create, edit, delete).
 * Uses React.lazy and Suspense to show a loader while the component is loading.
 * @returns Department list component with loading fallback
 */
export default function DepartmentsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <DepartmentList />
        </Suspense>
    );
}