"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { UserCircle, LogOut, Users, Building2 } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import Loader from "~/components/ui/Loader";

export default function SessionWrapper({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { showSuccess } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Handle redirects based on authentication
    useEffect(() => {
        if (status === "loading") return;

        // If path is not login and user isn't authenticated, redirect to login
        if (!session && pathname !== "/") {
            setIsRedirecting(true);
            router.push("/");
            return;
        }

        // If user is authenticated and on login page, redirect to employees
        if (session && pathname === "/") {
            setIsRedirecting(true);
            router.push("/employees");
            return;
        }

        // Reset redirecting state when done
        setIsRedirecting(false);
    }, [session, status, pathname, router]);

    // Show loading state during authentication check or redirects
    if (status === "loading" || isRedirecting) {
        return <Loader fullScreen />;
    }

    // Show login page without wrapper
    if (!session && pathname === "/") {
        return children;
    }

    // Helper function to determine if a path is active
    const isActive = (path: string) => {
        return pathname?.startsWith(path);
    };

    // Handle logout with toast notification
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
        showSuccess("You have been successfully logged out");
    };

    // Set the sidebar width value in one place for consistency
    const sidebarWidth = "w-46";
    const sidebarWidthPx = "184px";

    return (
        <div className="min-h-screen bg-gray-50">
            {session && (
                <header className="sticky top-0 z-20 bg-slate-800 text-white shadow-md">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold flex items-center">
                                    <Image
                                        src="/header-icon.png"
                                        alt="HR Admin"
                                        width={42}
                                        height={42}
                                        className="mr-2"
                                    />
                                    HR Administration System
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        {session.user?.name ?? session.user?.email}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="border-slate-500 bg-slate-700 text-white hover:border-slate-400 hover:bg-emerald-700 hover:text-white"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <div className="flex">
                {/* Fixed Sidebar navigation */}
                {session && (
                    <div className={`fixed ${sidebarWidth} h-[calc(100vh-4rem)] bg-slate-700 text-white shadow-lg z-10 overflow-y-auto`}>
                        <nav className="space-y-1 p-4">
                            <Link
                                href="/employees"
                                className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive('/employees')
                                        ? 'bg-emerald-700 text-white'
                                        : 'hover:bg-emerald-700'
                                }`}
                            >
                                <Users className="mr-3 h-5 w-5" />
                                Employees
                            </Link>
                            <Link
                                href="/departments"
                                className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive('/departments')
                                        ? 'bg-emerald-700 text-white'
                                        : 'hover:bg-emerald-700'
                                }`}
                            >
                                <Building2 className="mr-3 h-5 w-5" />
                                Departments
                            </Link>
                        </nav>
                    </div>
                )}

                {/* Main content with proper margin to avoid sidebar overlap */}
                <main
                    className={`flex-1 min-h-[calc(100vh-4rem)] overflow-auto p-6 bg-gray-50 ${
                        session ? `ml-[${sidebarWidthPx}]` : ''
                    }`}
                    style={session ? { marginLeft: sidebarWidthPx } : {}}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}