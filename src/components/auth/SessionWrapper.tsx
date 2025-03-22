"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { UserCircle, LogOut, Users, Building2, Menu } from "lucide-react";
import { useToast } from "~/components/ui/toast-provider";
import Loader from "~/components/ui/Loader";

/**
 * A session management and layout wrapper component for the application.
 * This component:
 * 1. Handles authentication flow and protected routes.
 * 2. Manages redirects based on authentication status.
 * 3. Displays appropriate loading states during transitions.
 * 4. Renders the application layout including header and sidebar when authenticated.
 * 5. Provides a collapsible sidebar menu that can be toggled.
 * @param props - Component props
 * @param props.children - Child components to render within the layout.
 * @returns A wrapped version of the children with authentication and layout.
 */
export default function SessionWrapper({ children }: { children: ReactNode }) {
    /** Access authentication session data and status */
    const { data: session, status } = useSession();
    /** Get current path for active link styling and redirect decisions */
    const pathname = usePathname();
    /** Router for navigation and redirects */
    const router = useRouter();
    /** Toast notifications for user feedback */
    const { showSuccess } = useToast();
    /** State to track if a redirect is in progress */
    const [isRedirecting, setIsRedirecting] = useState(false);
    /** State to track if the sidebar is collapsed */
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    /**
     * Handle redirects based on authentication status and current path.
     * Redirects:
     * - Unauthenticated users away from protected routes to login
     * - Authenticated users away from login page to the main application.
     * Reset redirecting state when done
     */
    useEffect(() => {
        if (status === "loading") return;

        if (!session && pathname !== "/") {
            setIsRedirecting(true);
            router.push("/");
            return;
        }

        if (session && pathname === "/") {
            setIsRedirecting(true);
            router.push("/employees");
            return;
        }

        setIsRedirecting(false);
    }, [session, status, pathname, router]);

    /** Show loading state during authentication check or redirects */
    if (status === "loading" || isRedirecting) {
        return <Loader fullScreen />;
    }

    /** Show login page without wrapper */
    if (!session && pathname === "/") {
        return children;
    }

    /**
     * Determines if a navigation link should be highlighted as active.
     * @param path - The base path to check against the current URL
     * @returns True if the current path starts with the given path
     */
    const isActive = (path: string) => {
        return pathname?.startsWith(path);
    };

    /**
     * Handles user logout with success notification
     */
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
        showSuccess("You have been successfully logged out");
    };

    /**
     * Toggles the sidebar between collapsed and expanded states
     */
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    /** Sidebar width values based on collapsed state */
    const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-46";
    const sidebarWidthPx = isSidebarCollapsed ? "64px" : "184px";

    return (
        <div className="min-h-screen bg-gray-50">
            {session && (
                <header className="sticky top-0 z-20 bg-slate-800 text-white shadow-md">
                    <div className="w-full px-1 sm:px-2 lg:px-4">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex-shrink-0 flex items-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleSidebar}
                                    className="mr-3 text-white hover:bg-emerald-700"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                                <h1 className="text-xl font-bold flex items-center">
                                    <Image
                                        src="/header-icon.png"
                                        alt="HR Admin"
                                        width={42}
                                        height={42}
                                        className="m-2"
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
                {/* Sidebar navigation */}
                {session && (
                    <div
                        className={`fixed ${sidebarWidth} h-[calc(100vh-4rem)] bg-slate-700 text-white shadow-lg z-10 overflow-y-auto transition-all duration-300 ease-in-out`}
                    >
                        <nav className="space-y-1 p-4">
                            <Link
                                href="/employees"
                                className={`flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive('/employees')
                                        ? 'bg-emerald-700 text-white'
                                        : 'hover:bg-emerald-700'
                                }`}
                                title="Employees"
                            >
                                <span className="flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </span>
                                {!isSidebarCollapsed && <span className="ml-3">Employees</span>}
                            </Link>
                            <Link
                                href="/departments"
                                className={`flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive('/departments')
                                        ? 'bg-emerald-700 text-white'
                                        : 'hover:bg-emerald-700'
                                }`}
                                title="Departments"
                            >
                                <span className="flex items-center justify-center">
                                    <Building2 className="h-5 w-5" />
                                </span>
                                {!isSidebarCollapsed && <span className="ml-3">Departments</span>}
                            </Link>
                        </nav>
                    </div>
                )}

                {/* Main content */}
                <main
                    className={`flex-1 min-h-[calc(100vh-4rem)] overflow-auto p-6 bg-gray-50 transition-all duration-300 ease-in-out`}
                    style={session ? { marginLeft: sidebarWidthPx } : {}}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}