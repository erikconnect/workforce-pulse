import "next-auth";

declare module "next-auth" {
  interface User {
    city?: string;
  }

  interface Session {
    user: User & {
      id?: string;
      city?: string;
    };
  }
}
