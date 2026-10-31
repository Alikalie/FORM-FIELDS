import { NextRequest, NextResponse } from "next/server";
import { isAdminRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const loginPath = request.nextUrl.searchParams.get("flow") === "admin"
    ? "/admin/login"
    : "/login";
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return redirectToLogin(request, loginPath, "magic_link_invalid");
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return redirectToLogin(request, loginPath, "magic_link_invalid");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify the magic-link user: ${userError.message}`);
  }
  if (!user) {
    return redirectToLogin(request, loginPath, "magic_link_invalid");
  }

  if (request.nextUrl.searchParams.get("flow") === "recovery") {
    return NextResponse.redirect(new URL("/reset-password", request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Unable to sign out after role verification failed: ${signOutError.message}`);
    }
    return redirectToLogin(request, loginPath, "admin_verification_failed");
  }

  if (!profile || !profile.is_active || !isAdminRole(profile.role)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Unable to sign out a non-admin magic-link user: ${signOutError.message}`);
    }
    return redirectToLogin(request, loginPath, "admin_only");
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}

function redirectToLogin(request: NextRequest, loginPath: string, error: string) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}
