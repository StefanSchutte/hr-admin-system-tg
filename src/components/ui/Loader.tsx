"use client";

import { useEffect, useState } from "react";

/**
 * Loader component for displaying loading states.
 * This component renders a spinner with optional text to indicate loading states. It can be displayed inline or as a full-screen overlay.
 * The component uses client-side mounting to ensure proper hydration and prevent server/client rendering mismatches.
 * Only render loader after component is mounted client-side.
 * @param props - Component props
 * @param props.fullScreen - Whether to display as a full-screen overlay with dark background
 * @returns React component or null before client-side mounting.
 */
export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/70">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
                    <p className="mt-4 text-white font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
            <span className="ml-3 text-slate-600">Loading data...</span>
        </div>
    );
}