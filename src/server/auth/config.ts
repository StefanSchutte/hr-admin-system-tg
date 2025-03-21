import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { db } from "~/server/db";

/**
 * NextAuth configuration object
 * Defines the authentication setup for the application, including:
 * - Session management strategy and duration.
 * - Custom login page path.
 * - JWT and session data augmentation.
 * - Credentials-based authentication provider.
 */
export const authConfig = {
  /** Session configuration. Sets the session strategy and maximum age. */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  /** Custom authentication pages configuration. Custom sign-in page path. */
  pages: {
    signIn: "/",
  },
  /** Callback functions for authentication events */
  callbacks: {
    /**
     * JWT callback to augment the token with user data.
     * @param params - JWT callback parameters
     * @param params.token - The existing JWT token
     * @param params.user - The user data from the credentials provider (if available)
     * @returns The augmented JWT token with additional user data
     */
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.name = user.name;
      }
      return token;
    },
    /**
     * Session callback to augment the session with data from the token.
     * @param params - Session callback parameters
     * @param params.session - The session object
     * @param params.token - The JWT token
     * @returns The augmented session with user data from the token
     */
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email!;
        session.user.role = token.role as string;
        session.user.employeeId = token.employeeId as string | undefined;
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  /** Authentication providers configuration. Credentials provider for email/password authentication.n*/
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorization function to validate credentials.
       * 1. Validates that email and password are provided
       * 2. Looks up the user in the database by email
       * 3. Verifies the password hash matches
       * 4. Returns user data on success or null on failure
       * @param credentials - The credentials submitted by the user
       * @returns User data if authentication succeeds, null otherwise
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
            credentials.password as string,
            user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          employeeId: user.employeeId ?? undefined,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;