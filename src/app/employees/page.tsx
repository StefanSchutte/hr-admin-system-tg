"use client";

import { Suspense, lazy } from "react";
import Loader from "~/components/ui/Loader";

const EmployeeList = lazy(() => import("~/components/employees/EmployeeList"));

/**
 * Renders the EmployeeList component which displays all employees and provides options for employee management (create, edit, delete).
 * Uses React.lazy and Suspense to show a loader while the component is loading.
 * @returns Employee list component with loading fallback
 */
export default function EmployeesPage() {
    return (
        <Suspense fallback={<Loader />}>
            <EmployeeList />
        </Suspense>
    );
}