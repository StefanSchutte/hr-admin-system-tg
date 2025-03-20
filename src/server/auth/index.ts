// src/server/auth/index.ts
import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

// This is the recommended way to cache the auth session in Next.js App Router
export const auth = cache(uncachedAuth);
export { handlers, signIn, signOut };