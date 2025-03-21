"use client";

import { useEffect, useState } from "react";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { UserPlus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";

// Define the Employee type inline
type Employee = {
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

// Type guard to check if an employee is valid
// Better approach to the type guard function
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

export default function EmployeeList() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [managerFilter, setManagerFilter] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    // Fetch employees with filters
    const {
        data: employees = [],
        isLoading: isEmployeesLoading,
        error: employeesError
    } = api.employee.getAll.useQuery({
        status: statusFilter as "ACTIVE" | "INACTIVE" | "ALL",
        managerId: managerFilter === "null" ? undefined : managerFilter ?? undefined,
        departmentId: departmentFilter === "null" ? undefined : departmentFilter ?? undefined,
    });

    // Fetch managers for filter dropdown
    const { data: managers = [], isLoading: isManagersLoading } = api.employee.getManagers.useQuery();

    // Fetch departments for filter dropdown
    const { data: departments = [], isLoading: isDepartmentsLoading } = api.department.getAll.useQuery({ status: "ACTIVE" });

    // Show error toast if data fetching fails
    useEffect(() => {
        if (employeesError) {
            showError(`Error loading employees: ${employeesError.message}`);
        }
    }, [employeesError, showError]);

    // Mutations for activating/deactivating employees
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

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const loadingToastId = await showLoading(`${currentStatus === "ACTIVE" ? "Deactivating" : "Activating"} employee...`);

        try {
            await toggleStatus.mutateAsync({ id, status: newStatus });
        } finally {
            dismissLoading(loadingToastId);
        }
    };

    // Filter employees based on search query
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

    // Calculate total pages and paginated data
    const totalPages = Math.ceil(filteredEmployees.length / pageSize);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Handle page navigation
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Check if data is still loading
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

            {/* Filters */}
            <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center">
                        <Filter className="mr-2 h-5 w-5 text-slate-500" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="ACTIVE">Active Only</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Department</label>
                            <Select
                                value={departmentFilter ?? undefined}
                                onValueChange={(value) => {
                                    setDepartmentFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Manager</label>
                            <Select
                                value={managerFilter ?? undefined}
                                onValueChange={(value) => {
                                    setManagerFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">All Managers</SelectItem>
                                    {managers.map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id}>
                                            {manager.firstName} {manager.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and display controls */}
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
                                <TableHead className="font-semibold">Actions</TableHead>
                                <TableHead className="font-semibold">First Name</TableHead>
                                <TableHead className="font-semibold">Last Name</TableHead>
                                <TableHead className="font-semibold">Telephone Number</TableHead>
                                <TableHead className="font-semibold">Email Address</TableHead>
                                <TableHead className="font-semibold">Manager</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
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
                            ) : filteredEmployees.length === 0 ? (
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
            {filteredEmployees.length > 0 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={goToPrevPage}
                        className="border-slate-300 hover:bg-slate-100"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="ml-1">Previous</span>
                    </Button>

                    <div className="flex space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                pageNum = currentPage - 3 + i;
                                if (pageNum > totalPages) {
                                    pageNum = totalPages - (4 - i);
                                }
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === currentPage ? "default" : "outline"}
                                    size="sm"
                                    className={
                                        pageNum === currentPage
                                            ? "bg-emerald-700 hover:bg-emerald-600"
                                            : "border-slate-300 hover:bg-slate-100"
                                    }
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={goToNextPage}
                        className="border-slate-300 hover:bg-slate-100"
                    >
                        <span className="mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}