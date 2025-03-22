/**
 * User role types
 * Defines the possible roles a user can have in the system
 */
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

/**
 * Status types
 * Defines the possible status values for employees and departments
 */
export type Status = "ACTIVE" | "INACTIVE";

/**
 * Sort direction options
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Employee types
 */

/**
 * Employee sort fields
 */
export type EmployeeSortField = 'firstName' | 'lastName' | 'manager' | 'status';

/**
 * Type representing an employee in the system
 */
export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    telephoneNumber: string;
    emailAddress: string;
    status: string;
    manager: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
};

/**
 * Employee form data for create/edit forms
 */
export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    telephoneNumber: string;
    emailAddress: string;
    managerId?: string;
    status: "ACTIVE" | "INACTIVE";
}

/**
 * Props interface for the EmployeeCreateEdit component
 */
export interface EmployeeCreateEditProps {
    /**
     * Optional existing employee data for edit mode
     * If provided, the form operates in edit mode; otherwise, it's in create mode
     */
    existingEmployee?: {
        id: string;
        firstName: string;
        lastName: string;
        telephoneNumber: string;
        emailAddress: string;
        managerId?: string | null;
        status?: "ACTIVE" | "INACTIVE";
    };
}

/**
 * Employee filter options
 */
export interface EmployeeFilters {
    status: "ALL" | "ACTIVE" | "INACTIVE";
    managerId?: string;
    departmentId?: string;
}

/**
 * Props for the EmployeeFilter component
 * @interface EmployeeFilterProps
 * @property {string} statusFilter - Current status filter value ("ALL", "ACTIVE", or "INACTIVE")
 * @property {function} setStatusFilter - Function to update the status filter
 * @property {string|null} departmentFilter - Current department filter value (department ID or null for all)
 * @property {function} setDepartmentFilter - Function to update the department filter
 * @property {string|null} managerFilter - Current manager filter value (manager ID or null for all)
 * @property {function} setManagerFilter - Function to update the manager filter
 * @property {Array<{id: string, name: string}>} departments - Array of department objects for populating the department filter
 * @property {Array<{id: string, firstName: string, lastName: string}>} managers - Array of manager objects for populating the manager filter
 * @property {function} setCurrentPage - Function to reset pagination to page 1 when filters change
 */
export interface EmployeeFilterProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    departmentFilter: string | null;
    setDepartmentFilter: (value: string) => void;
    managerFilter: string | null;
    setManagerFilter: (value: string) => void;
    departments: Array<{ id: string; name: string }>;
    managers: Array<{ id: string; firstName: string; lastName: string }>;
    setCurrentPage: (page: number) => void;
}

/**
 * Department types
 */

/**
 * Department sort fields
 */
export type DepartmentSortField = 'name' | 'manager' | 'status';

/**
 * Type representing a department in the system
 */
export type Department = {
    id: string;
    name: string;
    managerId: string;
    status: string;
    manager: {
        firstName: string;
        lastName: string;
    };
};

/**
 * Department form data for create/edit forms
 */
export interface DepartmentFormData {
    name: string;
    managerId: string;
    status: "ACTIVE" | "INACTIVE";
}

/**
 * Department filter options
 */
export interface DepartmentFilters {
    status: "ALL" | "ACTIVE" | "INACTIVE";
}

/**
 * Props interface for the DepartmentCreateEdit component
 */
export interface DepartmentCreateEditProps {
    /**
     * Optional existing department data for edit mode
     * If provided, the form operates in edit mode; otherwise, it's in create mode
     */
    existingDepartment?: {
        id: string;
        name: string;
        managerId: string;
        status?: string;
    };
}

/**
 * Props for the DepartmentFilter component
 * @interface DepartmentFilterProps
 * @property {string} statusFilter - Current status filter value ("ALL", "ACTIVE", or "INACTIVE")
 * @property {function} setStatusFilter - Function to update the status filter
 * @property {function} setCurrentPage - Function to reset pagination to page 1 when filters change
 */
export interface DepartmentFilterProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    setCurrentPage: (page: number) => void;
}

/**
 * Manager type for select dropdowns
 */
export interface ManagerOption {
    id: string;
    firstName: string;
    lastName: string;
}

/**
 * Department option for select dropdowns
 */
export interface DepartmentOption {
    id: string;
    name: string;
}

/**
 * Authentication types
 */

/**
 * Extended session user with role and employee ID
 */
export interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    employeeId?: string;
}

/**
 * Login form data
 */
export interface LoginValues {
    email: string;
    password: string;
}

/**
 * UI types
 */

/**
 * Props for the Pagination component.
 * @interface PaginationProps
 * @property {number} currentPage - The current page number (1-based)
 * @property {number} totalPages - The total number of pages
 * @property {function} onPageChange - Function called when page changes, receives the new page number
 */
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Type definition for the Toast context
 * Defines the methods available through the useToast hook
 */
export type ToastContextType = {
    /**
     * Displays a success toast notification
     * @param message - The message to display in the toast
     */
    showSuccess: (message: string) => void;
    /**
     * Displays an error toast notification
     * @param message - The message to display in the toast
     */
    showError: (message: string) => void;
    /**
     * Displays a loading toast notification
     * @param message - The message to display in the toast
     * @returns A promise that resolves to the toast ID, which can be used to dismiss the toast
     */
    showLoading: (message: string) => Promise<string>;
    /**
     * Dismisses a loading toast notification by its ID
     * @param toastId - The ID of the toast to dismiss
     */
    dismissLoading: (toastId: string) => void;
};