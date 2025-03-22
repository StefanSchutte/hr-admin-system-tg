// src/types/next-auth.d.ts
import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            employeeId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        employeeId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        employeeId?: string;
    }
}