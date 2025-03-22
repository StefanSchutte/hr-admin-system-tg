import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "~/components/ui/card";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import { SearchableSelect } from "~/components/ui/searchable-select";
import type { EmployeeFilterProps } from "~/types/types";

/**
 * EmployeeFilter Component
 * A collapsible filter panel for the employee list that allows filtering by status, department, and manager.
 * @param {EmployeeFilterProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function EmployeeFilter({
                                   statusFilter,
                                   setStatusFilter,
                                   departmentFilter,
                                   setDepartmentFilter,
                                   managerFilter,
                                   setManagerFilter,
                                   departments,
                                   managers,
                                   setCurrentPage
                               }: EmployeeFilterProps) {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    /** Convert departments to options format for SearchableSelect */
    const departmentOptions = [
        { value: "null", label: "All Departments" },
        ...departments.map(dept => ({
            value: dept.id,
            label: dept.name
        }))
    ];

    /** Convert managers to options format */
    const managerOptions = [
        { value: "null", label: "All Managers" },
        ...managers.map(manager => ({
            value: manager.id,
            label: `${manager.firstName} ${manager.lastName}`
        }))
    ];

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="pb-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-700 flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-slate-500" />
                    Filters
                </CardTitle>
                <button
                    onClick={toggleCollapse}
                    className="rounded-full p-1 hover:bg-slate-100 transition-colors"
                    aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
                >
                    {isCollapsed ? (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                    ) : (
                        <ChevronUp className="h-5 w-5 text-slate-500" />
                    )}
                </button>
            </CardHeader>

            {!isCollapsed && (
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
                            <SearchableSelect
                                options={departmentOptions}
                                value={departmentFilter ?? "null"}
                                onChangeAction={(value) => {
                                    setDepartmentFilter(value === "null" ? null : value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Select department"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Manager</label>
                            <SearchableSelect
                                options={managerOptions}
                                value={managerFilter ?? "null"}
                                onChangeAction={(value) => {
                                    setManagerFilter(value === "null" ? null : value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Select manager"
                            />
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}