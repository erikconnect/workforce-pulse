import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ROLE_BY_EMAIL } from "./roles";

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).trim().toLowerCase();
        const password = (credentials.password as string).trim();

        const validUsers: Record<string, { password: string; name: string }> = {
          "admin@montgomery.gov": { password: "demo123", name: "City Admin" },
          "city@montgomery.gov": { password: "demo123", name: "City Manager" },
          "citizen@montgomery.gov": { password: "demo123", name: "Alex Citizen" },
        };

        const entry = validUsers[email];
        if (!entry || entry.password !== password) return null;

        const role = ROLE_BY_EMAIL[email] ?? "citizen";
        return {
          id: email,
          email,
          name: entry.name,
          image: null,
          city: "Montgomery, AL",
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
        token.city = user.city;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.city = token.city as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "workforce-pulse-dev-secret-use-env-in-production"
      : undefined),
};
