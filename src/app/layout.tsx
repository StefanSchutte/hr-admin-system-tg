import { Metadata } from "next";
import "~/styles/globals.css";
import { Providers } from "./providers";
import SessionWrapper from "~/components/auth/SessionWrapper";
import React from "react";

/**
 * Application-wide metadata configuration.
 * Defines default SEO properties, browser tab information, and favicon.
 */
export const metadata: Metadata = {
    title: "HR Administration System",
    description: "Manage employees and departments",
    icons: {
        icon: [
            {url: '/favicon.png'},
        ],
    }
};

/**
 * Root layout component
 * Establishes the base HTML structure and applies the application-wide providers:
 * 1. Sets the HTML language
 * 2. Applies global styling
 * 3. Wraps the application with context providers
 * 4. Applies session management and authentication
 * This component is the top-level layout from which all pages inherit.
 * @param props - Component props
 * @param props.children - Page components to render within the layout
 * @returns Root HTML structure with providers and authentication
 */
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