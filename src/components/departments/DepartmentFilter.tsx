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

/**
 * Props for the DepartmentFilter component
 * @interface DepartmentFilterProps
 * @property {string} statusFilter - Current status filter value ("ALL", "ACTIVE", or "INACTIVE")
 * @property {function} setStatusFilter - Function to update the status filter
 * @property {function} setCurrentPage - Function to reset pagination to page 1 when filters change
 */
interface DepartmentFilterProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    setCurrentPage: (page: number) => void;
}

/**
 * DepartmentFilter Component
 * A collapsible filter panel for the department list that allows filtering by status.
 *
 * @param {DepartmentFilterProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function DepartmentFilter({
                                     statusFilter,
                                     setStatusFilter,
                                     setCurrentPage
                                 }: DepartmentFilterProps) {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    </div>
                </CardContent>
            )}
        </Card>
    );
}