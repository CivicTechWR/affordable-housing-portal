import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  ensureBootstrapAdmin,
  getUserForAuth,
  getUserForSession,
  isUserAllowedToSignIn,
  recordSuccessfulLogin,
} from "@/lib/auth/user-store";
import { verifyPassword } from "@/lib/auth/password";
import { signInSchema } from "@/lib/auth/validation";

const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        let user = await getUserForAuth(parsed.data.email);
        const bootstrapUser = await ensureBootstrapAdmin(parsed.data.email, parsed.data.password);

        if (bootstrapUser) {
          user = bootstrapUser;
        }

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!isUserAllowedToSignIn(user.status)) {
          return null;
        }

        const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        await recordSuccessfulLogin(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;

        return token;
      }

      if (!token.sub) {
        return token;
      }

      const currentUser = await getUserForSession(token.sub);

      if (!currentUser) {
        delete token.role;
        delete token.status;

        return token;
      }

      token.role = currentUser.role;
      token.status = currentUser.status;

      return token;
    },
    session({ session, token }) {
      if (!session.user || !token.sub) {
        return session;
      }

      session.user.id = token.sub;

      return session;
    },
    async authorized({ auth: currentAuth, request }) {
      const pathname = request.nextUrl.pathname;
      const userId = currentAuth?.user?.id;

      if (
        !pathname.startsWith("/api/admin") &&
        !pathname.startsWith("/admin") &&
        !(pathname.startsWith("/api/listings") && request.method !== "GET")
      ) {
        return true;
      }

      if (!userId) {
        return false;
      }

      const currentUser = await getUserForSession(userId);

      if (!currentUser || !isUserAllowedToSignIn(currentUser.status)) {
        return false;
      }

      if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
        return currentUser.role === "admin";
      }

      if (pathname.startsWith("/api/listings") && request.method !== "GET") {
        return currentUser.role === "admin" || currentUser.role === "partner";
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
