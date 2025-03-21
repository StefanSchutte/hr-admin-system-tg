"use client";

import DepartmentCreateEdit from "~/components/departments/DepartmentCreateEdit";

/**
 * Renders the DepartmentCreateEdit component in creation mode (without an existingDepartment prop), allowing users to create a new department in the system.
 * @returns Department creation form
 */
export default function DepartmentCreatePage() {
    return <DepartmentCreateEdit />;
}