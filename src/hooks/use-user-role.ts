"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/lib/roles";

export function useUserRole() {
  const { data: session, status } = useSession();
  const role: UserRole = session?.user?.role ?? "citizen";
  return {
    role,
    isAdmin: role === "admin",
    isCitizen: role === "citizen",
    isLoading: status === "loading",
  };
}
