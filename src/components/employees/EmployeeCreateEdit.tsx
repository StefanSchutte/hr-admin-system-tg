"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
    AlertCircle,
    User,
    Phone,
    Mail,
    Save,
    X,
    Users
} from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import type { EmployeeFormData, EmployeeCreateEditProps } from "~/types/types";
import { employeeSchema } from "~/types/validation-schemas";

/**
 * Employee creation and editing form component.
 * This component renders a form for creating new employees or editing existing ones.
 * It includes permission checks for admin-only operations, form validation,
 * and handles API interactions with appropriate feedback.
 * @param props - Component props
 * @param props.existingEmployee - Optional existing employee data for edit mode
 * @returns React component
 */
export default function EmployeeCreateEdit({ existingEmployee }: EmployeeCreateEditProps) {
    const router = useRouter();
    /** Get the current user session to determine permissions */
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError, showLoading, dismissLoading } = useToast();

    /** Flag indicating if the current user has administrative privileges */
    const isAdmin = session?.user?.role === "ADMIN";

    const utils = api.useUtils();

    /** Fetch managers for dropdown */
    const { data: managers = [] } = api.employee.getManagers.useQuery();

    /**
     * TRPC mutation for creating a new employee.
     * Create and update mutations with onSuccess handlers.
     * Invalidate the employees and managers query to refresh the list, since a new employee could potentially be a manager.
     */
    const createEmployee = api.employee.create.useMutation({
        onSuccess: () => {
            void utils.employee.getAll.invalidate();
            void utils.employee.getManagers.invalidate();
            showSuccess("Employee created successfully!");
            router.push("/employees");
        },
        onError: () => {
            showError(`Error creating employee`);
        }
    });

    /**
     * TRPC mutation for updating an existing employee.
     * Invalidate queries.
     */
    const updateEmployee = api.employee.update.useMutation({
        onSuccess: (data) => {
            void utils.employee.getAll.invalidate();
            void utils.employee.getById.invalidate(data.id);
            void utils.employee.getManagers.invalidate();
            showSuccess("Employee updated successfully!");
            router.push("/employees");
        },
        onError: () => {
            showError(`Error updating employee`);
        }
    });

    /**
     * React Hook Form setup with Zod validation.
     * Provide default values for new employees to ensure inputs are always controlled
     */
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: existingEmployee ? {
            firstName: existingEmployee.firstName,
            lastName: existingEmployee.lastName,
            telephoneNumber: existingEmployee.telephoneNumber,
            emailAddress: existingEmployee.emailAddress,
            managerId: existingEmployee.managerId ?? undefined,
            status: existingEmployee.status ?? "ACTIVE"
        } : {
            firstName: "",
            lastName: "",
            telephoneNumber: "",
            emailAddress: "",
            managerId: undefined,
            status: "ACTIVE"
        }
    });

    /**
     * Form submission handler.
     * Calls the appropriate mutation based on whether we're creating or editing.
     * Transform managerId if it's "null" string.
     * Update existing employee else create new employee
     * @param data - Validated form data
     */
    const onSubmit = async (data: EmployeeFormData) => {
        setIsSubmitting(true);
        const loadingToastId = await showLoading(existingEmployee ? "Updating employee..." : "Creating employee...");

        try {
            const formData = {
                ...data,
                managerId: data.managerId === "null" ? undefined : data.managerId
            };

            if (existingEmployee) {
                await updateEmployee.mutateAsync({
                    id: existingEmployee.id,
                    ...formData
                });
            } else {
                await createEmployee.mutateAsync(formData);
            }
        } catch (error) {
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
                        <Users className="mr-2 h-5 w-5" />
                        {existingEmployee ? "Edit Employee" : "Create Employee"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">First Name *</label>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter first name"
                                                    className={`pl-9 bg-white ${errors.firstName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.firstName.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">Last Name *</label>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter last name"
                                                    className={`pl-9 bg-white ${errors.lastName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">Telephone Number *</label>
                            <Controller
                                name="telephoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <Input
                                                {...field}
                                                placeholder="Enter telephone number"
                                                className={`pl-9 bg-white ${errors.telephoneNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.telephoneNumber && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.telephoneNumber.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">Email Address *</label>
                            <Controller
                                name="emailAddress"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter email address"
                                                className={`pl-9 bg-white ${errors.emailAddress ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.emailAddress && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.emailAddress.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">Manager</label>
                            <Controller
                                name="managerId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={existingEmployee && !isAdmin}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">No Manager</SelectItem>
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
                                )}
                            />
                            {existingEmployee && !isAdmin && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Only HR Administrators can change the manager.
                                </p>
                            )}
                        </div>

                        {/* Status field only for edit and for admin */}
                        {existingEmployee && isAdmin && (
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
                </CardContent>

                <CardFooter className="flex justify-end space-x-3 pt-6 pb-6 border-t bg-slate-50">

                    <Button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                {existingEmployee ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {existingEmployee ? "Update" : "Create"} Employee
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/employees")}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}