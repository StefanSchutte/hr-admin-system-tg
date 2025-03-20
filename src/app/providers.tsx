"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { ToastProvider } from "~/components/ui/toast-provider";

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