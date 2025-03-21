import { Metadata } from "next";
import "~/styles/globals.css";
import { Providers } from "./providers";
import SessionWrapper from "~/components/auth/SessionWrapper";
import React from "react";

export const metadata: Metadata = {
    title: "HR Administration System",
    description: "Manage employees and departments",
    icons: {
        icon: [
            {url: '/favicon.png'},
        ],
    }
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-gray-100">
        <Providers>
            <SessionWrapper>
                {children}
            </SessionWrapper>
        </Providers>
        </body>
        </html>
    );
}