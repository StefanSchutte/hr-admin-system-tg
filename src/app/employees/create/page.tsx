"use client";

import EmployeeCreateEdit from "~/components/employees/EmployeeCreateEdit";

/**
 * Renders the EmployeeCreateEdit component in creation mode (without an existingEmployee prop), allowing users to create a new employee in the system.
 * @returns Employee creation form
 */
export default function EmployeeCreatePage() {
    return <EmployeeCreateEdit />;
}