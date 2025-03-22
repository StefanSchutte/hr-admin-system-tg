import type { Metadata } from "next";
import LoginForm from "~/components/auth/LoginForm";

/**
 * Metadata configuration for the login page.
 * Defines SEO properties and browser tab information.
 */
export const metadata: Metadata = {
    title: "Login - HR Administration System",
    description: "Login to manage employees and departments",
};

/**
 * Renders the authentication form as the entry point to the application.
 * This page is the default route for unauthenticated users and the redirect target for users who attempt to access protected routes without authentication.
 * @returns Login form component
 */
export default function LoginPage() {
    return <LoginForm />;
}