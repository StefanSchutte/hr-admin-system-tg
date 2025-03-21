"use client";

import DepartmentList from "~/components/departments/DepartmentList";

/**
 * Renders the DepartmentList component which displays all departments and provides options for department management (create, edit, delete).
 * This component serves as the entry point for the departments section of the application.
 * @returns Department list component
 */
export default function DepartmentsPage() {
    return <DepartmentList />;
}