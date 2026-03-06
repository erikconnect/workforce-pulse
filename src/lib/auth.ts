import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        const validUsers: Record<string, string> = {
          "admin@montgomery.gov": "demo123",
          "city@montgomery.gov": "demo123",
        };
        const pwd = validUsers[email];
        if (!pwd || pwd !== password) return null;

        const name = email.split("@")[0];
        const city = "Montgomery, AL";
        return {
          id: "1",
          email,
          name: name.charAt(0).toUpperCase() + name.slice(1) + " Admin",
          image: null,
          city,
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
        token.city = (user as { city?: string }).city;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { city?: string }).city = token.city as string;
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
