import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

/**
 * Initialize NextAuth with the application's auth configuration.
 * Destructure the returned objects to access auth, handlers, and sign in/out functions.
 */
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

/**
 * Cached version of the auth function.
 * This implementation uses React's cache function to memoize the auth result, which is the recommended approach for authentication in Next.js App Router.
 * Caching prevents redundant authentication checks during server rendering.
 */
export const auth = cache(uncachedAuth);
/**
 * NextAuth API route handlers.
 * Used to handle authentication requests at the API routes.
 * Provides trigger for sign-in/sign-out flow.
 */
export { handlers, signIn, signOut };