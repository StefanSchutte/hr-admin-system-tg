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
import { Card } from "~/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import { DepartmentFilter } from "~/components/departments/DepartmentFilter";
import { renderSortIndicator, handleSort } from "~/lib/sort-utils";
import Pagination from "~/components/ui/Pagination";
import { calculatePagination } from "~/lib/pagination-utils";

/** Available fields for sorting departments */
type SortField = 'name' | 'manager' | 'status';
/** Sort direction options */
type SortDirection = 'asc' | 'desc';

/**
 * Type representing a department in the system
 */
type Department = {
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
 * DepartmentList component
 * This component displays a list of departments with filtering, sorting, and pagination capabilities.
 * It allows users to search for departments, filter by status, sort by different fields,
 * and navigate through paginated results.
 * @returns Rendered DepartmentList component
 */
export default function DepartmentList() {
    const router = useRouter();
    /** Filter by department status (ALL, ACTIVE, INACTIVE) */
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    /** Text search query for filtering departments */
    const [searchQuery, setSearchQuery] = useState<string>("");
    /** Number of items to display per page */
    const [pageSize, setPageSize] = useState<number>(10);
    /** Current page number */
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    /** Field currently being used for sorting */
    const [sortField, setSortField] = useState<SortField>('name');
    /** Current sort direction */
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    /** Fetch departments with applied filters */
    const {
        data: departments = [],
        isLoading,
        error: departmentsError
    } = api.department.getAll.useQuery({
        status: statusFilter as "ACTIVE" | "INACTIVE" | "ALL",
    });

    /** Show error toast if data fetching fails */
    useEffect(() => {
        if (departmentsError) {
            showError(`Error loading departments: ${departmentsError.message}`);
        }
    }, [departmentsError, showError]);

    /** Mutation for toggling department status */
    const utils = api.useUtils();
    const toggleStatus = api.department.toggleStatus.useMutation({
        onSuccess: (_, variables) => {
            void utils.department.getAll.invalidate();
            const newStatus = variables.status;
            showSuccess(`Department ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
        },
        onError: (error) => {
            showError(`Error toggling department status: ${error.message}`);
        }
    });

    /**
     * Handles the toggling of a department's status.
     * @param id - The ID of the department
     * @param currentStatus - The current status of the department
     */
    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const loadingToastId = await showLoading(`${currentStatus === "ACTIVE" ? "Deactivating" : "Activating"} department...`);

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
    const handleSortColumn = (field: SortField) => {
        handleSort(field, sortField, setSortField, sortDirection, setSortDirection);
    };

    /** Filter departments based on search query */
    const filteredDepartments = departments?.filter(department => {
        if (!searchQuery) return true;

        const name = department.name.toLowerCase();
        const managerName = `${department.manager.firstName} ${department.manager.lastName}`.toLowerCase();
        const query = searchQuery.toLowerCase();

        return name.includes(query) || managerName.includes(query);
    });

    /** Sort the filtered departments */
    const sortedDepartments: Department[] = [...(filteredDepartments || [])].sort((a, b) => {
        let comparison;

        switch (sortField) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
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
     * Calculate pagination details for the department list.
     * @type {Object} Pagination results
     * @property {number} totalPages - The total number of pages based on the dataset size and page size
     * @property {Department[]} paginatedItems - The slice of departments for the current page, renamed to paginatedDepartments
     */
    const { totalPages, paginatedItems: paginatedDepartments } = calculatePagination<Department>(
        sortedDepartments,
        pageSize,
        currentPage
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                <Button
                    onClick={() => router.push("/departments/create")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Department
                </Button>
            </div>

            <DepartmentFilter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                setCurrentPage={setCurrentPage}
            />

            {/* Display controls */}
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

            {/* Departments table */}
            <Card className="border-none shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-semibold w-32">Actions</TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-64"
                                    onClick={() => handleSortColumn('name')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Name</span>
                                        {renderSortIndicator(sortField, 'name', sortDirection)}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-64"
                                    onClick={() => handleSortColumn('manager')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Manager</span>
                                        {renderSortIndicator(sortField, 'manager', sortDirection)}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-32"
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
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-500">Loading data...</div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-600">
                                        No departments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDepartments?.map((department) => (
                                    <TableRow key={department.id} className="hover:bg-slate-50">
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/departments/edit/${department.id}`}>
                                                    <Button variant="outline" size="sm" className="border-slate-300 hover:border-slate-400 hover:bg-slate-100">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={
                                                        department.status === "ACTIVE"
                                                            ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                                                    }
                                                    onClick={() => handleToggleStatus(department.id, department.status)}
                                                >
                                                    {department.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell>
                                            {`${department.manager.firstName} ${department.manager.lastName}`}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    department.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {department.status}
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
            {sortedDepartments.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}