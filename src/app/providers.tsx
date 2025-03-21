"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { ToastProvider } from "~/components/ui/toast-provider";

/**
 * Component that wraps the application with all required providers.
 * 1. SessionProvider - Handles authentication state
 * 2. TRPCReactProvider - Enables type-safe API access
 * 3. ToastProvider - Provides toast notification functionality
 * @param props - Component props
 * @param props.children - Child components that will have access to all providers
 * @returns React component with all providers applied.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <TRPCReactProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </TRPCReactProvider>
        </SessionProvider>
    );
}