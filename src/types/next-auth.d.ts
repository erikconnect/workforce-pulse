import "next-auth";

export type UserRole = "admin" | "citizen";

declare module "next-auth" {
  interface User {
    city?: string;
    role?: UserRole;
  }

  interface Session {
    user: User & {
      id?: string;
      city?: string;
      role?: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    city?: string;
    role?: UserRole;
  }
}
