"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { Card } from "~/components/ui/card";
import { UserPlus, Search } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import { EmployeeFilter } from "~/components/employees/EmployeeFilter";
import { renderSortIndicator, handleSort } from "~/lib/sort-utils";
import Pagination from "~/components/ui/Pagination";
import { calculatePagination } from "~/lib/pagination-utils";
import type {
    Employee,
    EmployeeSortField,
    SortDirection,
} from "~/types/types";

/**
 * Type guard to check if an object is a valid Employee.
 * @param employee - The object to check
 * @returns True if the object is a valid Employee, false otherwise
 */
function isValidEmployee(employee: unknown): employee is Employee {
    if (!employee || typeof employee !== 'object') return false;

    const e = employee as Record<string, unknown>;

    return typeof e.id === 'string' &&
        typeof e.firstName === 'string' &&
        typeof e.lastName === 'string' &&
        typeof e.emailAddress === 'string' &&
        typeof e.telephoneNumber === 'string' &&
        typeof e.status === 'string';
}

/**
 * EmployeeList component
 * This component displays a list of employees with filtering, sorting, and pagination capabilities.
 * It allows users to search for employees, filter by status, department, or manager, sort by different fields, and navigate through paginated results.
 * @returns Rendered EmployeeList component
 */
export default function EmployeeList() {
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";
    /** Filter by employee status (ALL, ACTIVE, INACTIVE) */
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    /** Filter by manager (manager ID or null for all) */
    const [managerFilter, setManagerFilter] = useState<string | null>(null);
    /** Filter by department (department ID or null for all) */
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    /** Text search query for filtering employees */
    const [searchQuery, setSearchQuery] = useState<string>("");
    /** Number of items to display per page */
    const [pageSize, setPageSize] = useState<number>(10);
    /** Current page number */
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    /** Field currently being used for sorting */
    const [sortField, setSortField] = useState<EmployeeSortField>('firstName');
    /** Current sort direction */
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    /** Fetch employees with applied filters */
    const {
        data: employees = [],
        isLoading: isEmployeesLoading,
        error: employeesError
    } = api.employee.getAll.useQuery({
        status: statusFilter as "ACTIVE" | "INACTIVE" | "ALL",
        managerId: managerFilter === "null" ? undefined : managerFilter ?? undefined,
        departmentId: departmentFilter === "null" ? undefined : departmentFilter ?? undefined,
    });

    /** Fetch managers for filter dropdown */
    const { data: managers = [], isLoading: isManagersLoading } = api.employee.getManagers.useQuery();

    /** Fetch departments for filter dropdown */
    const { data: departments = [], isLoading: isDepartmentsLoading } = api.department.getAll.useQuery({ status: "ACTIVE" });

    /** Show error toast if data fetching fails */
    useEffect(() => {
        if (employeesError) {
            showError(`Error loading employees: ${employeesError.message}`);
        }
    }, [employeesError, showError]);

    /** Mutation for toggling employee status */
    const utils = api.useUtils();
    const toggleStatus = api.employee.toggleStatus.useMutation({
        onSuccess: (_, variables) => {
            void utils.employee.getAll.invalidate();
            const newStatus = variables.status;
            showSuccess(`Employee ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
        },
        onError: (error) => {
            showError(`Error toggling employee status: ${error.message}`);
        }
    });

    /**
     * Handles the toggling of an employee's status.
     * @param id - The ID of the employee
     * @param currentStatus - The current status of the employee
     */
    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const loadingToastId = await showLoading(`${currentStatus === "ACTIVE" ? "Deactivating" : "Activating"} employee...`);

        try {
            await toggleStatus.mutateAsync({ id, status: newStatus });
        } finally {
            dismissLoading(loadingToastId);
        }
    };

    /**
     * Wrapper for the handleSort utility that works with this component's state
     * @param field - The field to sort by
     */
    const handleSortColumn = (field: EmployeeSortField) => {
        handleSort(field, sortField, setSortField, sortDirection, setSortDirection);
    };

    /** Filter employees based on search query */
    const filteredEmployees = employees
        .filter(isValidEmployee)
        .filter(employee => {
            if (!searchQuery) return true;

            const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
            const email = employee.emailAddress.toLowerCase();
            const phone = employee.telephoneNumber;
            const query = searchQuery.toLowerCase();

            return fullName.includes(query) || email.includes(query) || phone.includes(query);
        });

    /** Sort the filtered employees */
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        let comparison;

        switch (sortField) {
            case 'firstName':
                comparison = a.firstName.localeCompare(b.firstName);
                break;
            case 'lastName':
                comparison = a.lastName.localeCompare(b.lastName);
                break;
            case 'manager':
                const managerA = a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : '';
                const managerB = b.manager ? `${b.manager.firstName} ${b.manager.lastName}` : '';
                comparison = managerA.localeCompare(managerB);
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            default:
                comparison = 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    /**
     * Calculate pagination details for the employee list.
     * @type {Object} Pagination results
     * @property {number} totalPages - The total number of pages based on the dataset size and page size.
     * @property {Employee[]} paginatedItems - The slice of employees for the current page, renamed to paginatedEmployees.
     */
    const { totalPages, paginatedItems: paginatedEmployees } = calculatePagination(
        sortedEmployees,
        pageSize,
        currentPage
    );

    /** Check if data is still loading */
    const isLoading = isEmployeesLoading || isManagersLoading || isDepartmentsLoading;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
                <Button
                    onClick={() => router.push("/employees/create")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            <EmployeeFilter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                managerFilter={managerFilter}
                setManagerFilter={setManagerFilter}
                departments={departments}
                managers={managers}
                setCurrentPage={setCurrentPage}
            />

            {/* Search/Display controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Show per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-full sm:w-64 relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            {/* Employees table */}
            <Card className="border-none shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-semibold w-32">Actions</TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-32"
                                    onClick={() => handleSortColumn('firstName')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>First Name</span>
                                        {renderSortIndicator(sortField, 'firstName', sortDirection)}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-32"
                                    onClick={() => handleSortColumn('lastName')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Last Name</span>
                                        {renderSortIndicator(sortField, 'lastName', sortDirection)}
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold w-40">Telephone Number</TableHead>
                                <TableHead className="font-semibold w-48">Email Address</TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-40"
                                    onClick={() => handleSortColumn('manager')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Manager</span>
                                        {renderSortIndicator(sortField, 'manager', sortDirection)}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-28"
                                    onClick={() => handleSortColumn('status')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        {renderSortIndicator(sortField, 'status', sortDirection)}
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-500">Loading data...</div>
                                    </TableCell>
                                </TableRow>
                            ) : sortedEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-600">
                                        No employees found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedEmployees.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-slate-50">
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/employees/edit/${employee.id}`}>
                                                    <Button variant="outline" size="sm" className="border-slate-300 hover:border-slate-400 hover:bg-slate-100">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={
                                                        employee.status === "ACTIVE"
                                                            ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                                                    }
                                                    onClick={() => handleToggleStatus(employee.id, employee.status)}
                                                    disabled={!isAdmin}
                                                >
                                                    {employee.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.firstName}</TableCell>
                                        <TableCell>{employee.lastName}</TableCell>
                                        <TableCell>{employee.telephoneNumber}</TableCell>
                                        <TableCell>{employee.emailAddress}</TableCell>
                                        <TableCell>
                                            {employee.manager
                                                ? `${employee.manager.firstName} ${employee.manager.lastName}`
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    employee.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {employee.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination */}
            {sortedEmployees.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}