"use client";

import EmployeeList from "~/components/employees/EmployeeList";

/**
 * Renders the EmployeeList component which displays all employees and provides options for employee management (create, edit, delete).
 * This component serves as the entry point for the employees section of the application.
 * @returns Employee list component
 */
export default function EmployeesPage() {
    return <EmployeeList />;
}