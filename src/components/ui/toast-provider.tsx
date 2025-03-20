"use client";

import { Toaster, toast } from "react-hot-toast";
import { ReactNode, createContext, useContext } from "react";

// Define toast context type
type ToastContextType = {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showLoading: (message: string) => Promise<string>;
    dismissLoading: (toastId: string) => void;
};

// Create the context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
    // Success toast
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

    // Error toast
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

    // Loading toast with promise support
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

    // Dismiss loading toast
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

// Custom hook to use the toast context
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};