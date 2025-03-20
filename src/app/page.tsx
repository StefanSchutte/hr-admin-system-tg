import { Metadata } from "next";
import LoginForm from "~/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Login - HR Administration System",
    description: "Login to manage employees and departments",
};

export default function LoginPage() {
    return <LoginForm />;
}