import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ADMIN_ONLY_ROUTES } from "@/lib/roles";

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const secret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "development"
    ? "workforce-pulse-dev-secret-use-env-in-production"
    : undefined);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (token?.role !== "admin") {
      const isAdminRoute = ADMIN_ONLY_ROUTES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
      );
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    secret,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/map/:path*",
    "/sectors/:path*",
    "/skills/:path*",
    "/missions/:path*",
    "/playbooks/:path*",
    "/crawl/:path*",
    "/settings/:path*",
  ],
};
