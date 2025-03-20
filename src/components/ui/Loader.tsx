// src/components/ui/Loader.tsx
"use client";

import { useEffect, useState } from "react";

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
    // Use client-side state to ensure server/client rendering matches
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only render loader after component is mounted client-side
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