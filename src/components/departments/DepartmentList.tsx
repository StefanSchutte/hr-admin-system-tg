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
import { PlusCircle, Search, Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";

// Define sorting options
type SortField = 'name' | 'manager' | 'status';
type SortDirection = 'asc' | 'desc';

export default function DepartmentList() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    // Add sorting state
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Fetch departments with filters
    const {
        data: departments = [],
        isLoading,
        error: departmentsError
    } = api.department.getAll.useQuery({
        status: statusFilter as "ACTIVE" | "INACTIVE" | "ALL",
    });

    // Show error toast if data fetching fails
    useEffect(() => {
        if (departmentsError) {
            showError(`Error loading departments: ${departmentsError.message}`);
        }
    }, [departmentsError, showError]);

    // Mutations for activating/deactivating departments
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

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const loadingToastId = await showLoading(`${currentStatus === "ACTIVE" ? "Deactivating" : "Activating"} department...`);

        try {
            await toggleStatus.mutateAsync({ id, status: newStatus });
        } finally {
            dismissLoading(loadingToastId);
        }
    };

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter departments based on search query
    const filteredDepartments = departments?.filter(department => {
        if (!searchQuery) return true;

        const name = department.name.toLowerCase();
        const managerName = `${department.manager.firstName} ${department.manager.lastName}`.toLowerCase();
        const query = searchQuery.toLowerCase();

        return name.includes(query) || managerName.includes(query);
    });

    // Sort the filtered departments
    const sortedDepartments = [...(filteredDepartments || [])].sort((a, b) => {
        let comparison = 0;

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

    // Calculate total pages and paginated data
    const totalPages = Math.ceil((sortedDepartments?.length || 0) / pageSize);
    const paginatedDepartments = sortedDepartments?.slice(
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

    // Render sort indicator based on current sort field and direction
    const renderSortIndicator = (field: SortField) => {

        return (
            <div className="w-4 flex justify-center">
                {sortField === field ? (
                    sortDirection === 'asc' ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronUp className="h-4 w-4" />
                    )
                ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400 opacity-50" />
                )}
            </div>
        );
    };

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

            {/* Filters */}
            <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center">
                        <Filter className="mr-2 h-5 w-5 text-slate-500" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value)}
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
                    </div>
                </CardContent>
            </Card>

            {/* Display controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1); // Reset to first page when changing page size
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
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Name</span>
                                        {renderSortIndicator('name')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-64"
                                    onClick={() => handleSort('manager')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Manager</span>
                                        {renderSortIndicator('manager')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer w-32"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        {renderSortIndicator('status')}
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
            {filteredDepartments && filteredDepartments.length > 0 && (
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