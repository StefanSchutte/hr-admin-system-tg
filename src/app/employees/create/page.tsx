"use client";

import { Suspense, lazy } from "react";
import Loader from "~/components/ui/Loader";

const EmployeeCreateEdit = lazy(() => import("~/components/employees/EmployeeCreateEdit"));

/**
 * Renders the EmployeeCreateEdit component in creation mode with Suspense for better loading experience.
 * Uses React.lazy to load the form component, showing a loader while it's being loaded.
 * @returns Employee creation form with loading fallback
 */
export default function EmployeeCreatePage() {
    return (
        <Suspense fallback={<Loader />}>
            <EmployeeCreateEdit />
        </Suspense>
    );
}