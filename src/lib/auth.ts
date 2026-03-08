import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import Auth0Provider from "next-auth/providers/auth0";
import { ROLE_BY_EMAIL } from "./roles";

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

const googleClientId = firstEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = firstEnv("GOOGLE_CLIENT_SECRET");

const linkedInClientId = firstEnv("LINKEDIN_CLIENT_ID");
const linkedInClientSecret = firstEnv("LINKEDIN_CLIENT_SECRET");

const githubClientId = firstEnv("GITHUB_ID", "GITHUB_CLIENT_ID");
const githubClientSecret = firstEnv("GITHUB_SECRET", "GITHUB_CLIENT_SECRET");

const azureClientId = firstEnv("AZURE_AD_CLIENT_ID");
const azureClientSecret = firstEnv("AZURE_AD_CLIENT_SECRET");
const azureTenantId = firstEnv("AZURE_AD_TENANT_ID");

const auth0ClientId = firstEnv("AUTH0_CLIENT_ID");
const auth0ClientSecret = firstEnv("AUTH0_CLIENT_SECRET");
const auth0Issuer = firstEnv("AUTH0_ISSUER");

if (!process.env.NEXTAUTH_URL) {
  const authUrl = firstEnv("AUTH_URL");
  if (authUrl) {
    process.env.NEXTAUTH_URL = authUrl;
  } else if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
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
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    ...(linkedInClientId && linkedInClientSecret
      ? [
          LinkedInProvider({
            clientId: linkedInClientId,
            clientSecret: linkedInClientSecret,
          }),
        ]
      : []),
    ...(githubClientId && githubClientSecret
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }),
        ]
      : []),
    ...(azureClientId && azureClientSecret && azureTenantId
      ? [
          AzureADProvider({
            clientId: azureClientId,
            clientSecret: azureClientSecret,
            tenantId: azureTenantId,
          }),
        ]
      : []),
    ...(auth0ClientId && auth0ClientSecret && auth0Issuer
      ? [
          Auth0Provider({
            clientId: auth0ClientId,
            clientSecret: auth0ClientSecret,
            issuer: auth0Issuer,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      // Require a valid email so role mapping and profile bootstrapping are deterministic.
      return Boolean(user.email && user.email.trim().length > 3);
    },
    async jwt({ token, user }) {
      if (user) {
        const normalizedEmail = user.email?.trim().toLowerCase();
        token.id = user.id ?? normalizedEmail;
        token.email = normalizedEmail;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
        token.city = user.city ?? "Montgomery, AL";
        token.role = (normalizedEmail ? ROLE_BY_EMAIL[normalizedEmail] : undefined) ?? user.role ?? "citizen";
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
