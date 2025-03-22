/**
 * Sort direction options
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Interface for page component props in the dynamic department and Employee edit route.
 * In Next.js App Router with this configuration, route params are provided as a Promise.
 */
export interface PageProps {
    /**
     * The route parameters as a Promise that resolves to an object containing the department ID.
     * Must be awaited before accessing properties.
     */
    params: Promise<{
        id: string;
    }>;
}

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
    setDepartmentFilter: (value: string | null) => void;
    managerFilter: string | null;
    setManagerFilter: (value: string | null ) => void;
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
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showLoading: (message: string) => Promise<string>;
    dismissLoading: (toastId: string) => void;
};

/**
 * Interface for search functionality in select dropdown.
 */
export interface SearchableSelectProps {
    value: string;
    onChangeAction: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}