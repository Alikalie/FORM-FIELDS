import "server-only";
import { cache } from "react";

import { createClient } from "./server";

export const getAuthenticatedProfile = cache(async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && userError.name !== "AuthSessionMissingError") {
    throw new Error(`Unable to verify the current user: ${userError.message}`);
  }

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, created_at, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to verify the user's role: ${profileError.message}`);
  }

  const metadataName = user.user_metadata?.full_name;
  const fullName =
    profile?.full_name ||
    (typeof metadataName === "string" ? metadataName : "") ||
    user.email?.split("@")[0] ||
    "there";

  return {
    supabase,
    user,
    fullName,
    role: profile?.role ?? "user",
    isActive: profile?.is_active ?? true,
    createdAt: profile?.created_at ?? user.created_at,
  };
});

export function isAdminRole(role: string) {
  return role === "admin" || role === "super_admin";
}
