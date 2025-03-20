"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { AlertCircle, Building2, Save, X } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";

// Validation schema
const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    managerId: z.string().min(1, "Manager is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentCreateEditProps {
    existingDepartment?: {
        id: string;
        name: string;
        managerId: string;
        status?: string;
    };
}

export default function DepartmentCreateEdit({ existingDepartment }: DepartmentCreateEditProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    const utils = api.useUtils();

    // Fetch managers for dropdown
    const { data: managers = [], isLoading: managersLoading } = api.employee.getAllForDepartmentManager.useQuery();

    // Create and update mutations
    const createDepartment = api.department.create.useMutation({
        onSuccess: () => {
            // Invalidate the departments query to refresh the list
            void utils.department.getAll.invalidate();
            showSuccess("Department created successfully!");
            router.push("/departments");
        },
        onError: (error) => {
            showError(`Error creating department: ${error.message}`);
        }
    });

    const updateDepartment = api.department.update.useMutation({
        onSuccess: () => {
            // Invalidate the departments query to refresh the list
            void utils.department.getAll.invalidate();
            showSuccess("Department updated successfully!");
            router.push("/departments");
        },
        onError: (error) => {
            showError(`Error updating department: ${error.message}`);
        }
    });

    // Form setup
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: existingDepartment ? {
            name: existingDepartment.name,
            managerId: existingDepartment.managerId,
            status: (existingDepartment.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE"
        } : {}
    });

    // Form submission handler
    const onSubmit = async (data: DepartmentFormData) => {
        setIsSubmitting(true);
        const loadingToastId = await showLoading(existingDepartment ? "Updating department..." : "Creating department...");

        try {
            if (existingDepartment) {
                // Update existing department
                await updateDepartment.mutateAsync({
                    id: existingDepartment.id,
                    ...data
                });
            } else {
                // Create new department
                await createDepartment.mutateAsync(data);
            }
        } catch (error) {
            // Handle errors
            setError("root", {
                type: "manual",
                message: error instanceof Error ? error.message : "An error occurred"
            });
            setIsSubmitting(false);
        } finally {
            dismissLoading(loadingToastId);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-md">
                <CardHeader className="bg-slate-800 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                        <Building2 className="mr-2 h-5 w-5" />
                        {existingDepartment ? "Edit Department" : "Create Department"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                    {managers.length === 0 && !managersLoading ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                                <div>
                                    <p className="text-amber-800">You need to create at least one employee before creating a department.</p>
                                    <Button
                                        onClick={() => router.push('/employees/create')}
                                        className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Create Employee First
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">Department Name *</label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Input
                                                {...field}
                                                placeholder="Enter department name"
                                                className={`bg-white ${errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">Department Manager *</label>
                                <Controller
                                    name="managerId"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className={`bg-white ${errors.managerId ? "border-red-300" : ""}`}>
                                                    <SelectValue placeholder="Select manager" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {managers.map((manager) => (
                                                        <SelectItem
                                                            key={manager.id}
                                                            value={manager.id}
                                                        >
                                                            {manager.firstName} {manager.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.managerId && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.managerId.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Status field only for edit and for admin */}
                            {existingDepartment && (
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-700">Status</label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE" className="text-emerald-600">Active</SelectItem>
                                                    <SelectItem value="INACTIVE" className="text-red-600">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}

                            {errors.root && (
                                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                                    <div className="flex">
                                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                                        <span>{errors.root.message}</span>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </CardContent>

                {(managers.length > 0 || managersLoading) && (
                    <CardFooter className="flex justify-end space-x-3 pt-2 pb-6 border-t bg-slate-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/departments")}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {existingDepartment ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {existingDepartment ? "Update" : "Create"} Department
                                </>
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}