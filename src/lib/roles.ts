export type UserRole = "admin" | "citizen";

/** Maps email to role. Extend this as more users are added. */
export const ROLE_BY_EMAIL: Record<string, UserRole> = {
  "admin@montgomery.gov": "admin",
  "city@montgomery.gov": "admin",
  "citizen@montgomery.gov": "citizen",
};

/** Routes that require admin role. Citizen is redirected to /dashboard. */
export const ADMIN_ONLY_ROUTES = ["/crawl", "/playbooks"];
