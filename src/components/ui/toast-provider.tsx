"use client";

import { Toaster, toast } from "react-hot-toast";
import { ReactNode, createContext, useContext } from "react";
import type { ToastContextType } from "~/types/types";

/**
 * Context to store toast notification methods.
 * @internal
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast provider component that provides standardized toast notifications.
 * This component wraps the application with a context provider that offers styled toast notifications for success, error, and loading states.
 * @param props - Component props
 * @param props.children - Child components that will have access to the toast context
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    /**
     * Displays a success toast notification with standard styling.
     * @param message - The message to display in the toast.
     */
    const showSuccess = (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: "top-right",
            style: {
                background: "#10B981",
                color: "white",
                fontWeight: "500",
            },
            iconTheme: {
                primary: "white",
                secondary: "#10B981",
            },
        });
    };

    /**
     * Displays an error toast notification.
     * @param message - The message to display in the toast.
     */
    const showError = (message: string) => {
        toast.error(message, {
            duration: 4000,
            position: "top-right",
            style: {
                background: "#EF4444",
                color: "white",
                fontWeight: "500",
            },
            iconTheme: {
                primary: "white",
                secondary: "#EF4444",
            },
        });
    };

    /**
     * Displays a loading toast notification with standard styling.
     * @param message - The message to display in the toast
     * @returns A promise that resolves to the toast ID, which can be used to dismiss the toast.
     */
    const showLoading = async (message: string): Promise<string> => {
        const toastId = toast.loading(message, {
            position: "top-right",
            style: {
                background: "#3B82F6",
                color: "white",
                fontWeight: "500",
            },
        });
        return toastId;
    };

    /**
     * Dismisses a loading toast notification by its ID.
     * @param toastId - The ID of the toast to dismiss
     */
    const dismissLoading = (toastId: string) => {
        toast.dismiss(toastId);
    };

    return (
        <ToastContext.Provider
            value={{ showSuccess, showError, showLoading, dismissLoading }}
        >
            {children}
            <Toaster />
        </ToastContext.Provider>
    );
}

/**
 * Custom hook to access toast notification methods.
 * This hook provides access to the standardized toast notification methods.
 * @returns An object containing toast notification methods.
 * @throws Error if used outside of a ToastProvider.
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};