"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Lock, User } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import type { LoginValues } from "~/types/types";
import { loginSchema } from "~/types/validation-schemas"

/**
 * Login form component for user authentication.
 * This component provides a styled login form with:
 * - Email and password inputs with validation.
 * - Form submission handling with loading states.
 * - Error feedback for authentication failures.
 * - Success notifications and redirect on successful login.
 * @returns React component for the login form
 */
export default function LoginForm() {
    const router = useRouter();
    /** State for tracking and displaying authentication errors */
    const [error, setError] = useState<string | null>(null);
    /** Toast notifications for user feedback */
    const { showSuccess, showError } = useToast();
    /** State for tracking login request status for loading indicators */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * React Hook Form setup with Zod validation.
     */
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    /**
     * Form submission handler
     * Attempts authentication with provided credentials and handles success/failure cases.
     * @param values - Validated form values containing email and password
     */
    async function onSubmit(values: LoginValues) {
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                showError("Invalid email or password");
            } else {
                showSuccess("Login successful!");
                router.push("/employees");
            }
        } catch {
            setError("An unexpected error occurred");
            showError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-400">
            <div className="w-full max-w-md px-4">
                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-slate-800 text-white rounded-t-lg space-y-1">
                        <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
                        <CardDescription className="text-slate-300 text-center">
                            HR Administration System
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="pt-6 pb-4">
                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">Username</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Email address"
                                                            className="pl-10 bg-slate-50"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage className="text-sm" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">Password</FormLabel>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Password"
                                                            className="pl-10 bg-slate-50"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage className="text-sm" />
                                            </FormItem>
                                        )}
                                    />

                                    {error && (
                                        <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center border-t pt-6 pb-6">
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    );
}