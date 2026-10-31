import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.getClaims();
  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error(`Unable to refresh the Supabase session: ${error.message}`);
  }

  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login";
  const isAdminRoute =
    !isAdminLoginPage &&
    (request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname.startsWith("/admin/"));
  const isDashboardRoute =
    request.nextUrl.pathname === "/dashboard" ||
    request.nextUrl.pathname.startsWith("/dashboard/");

  if (isAdminRoute || isDashboardRoute) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError && userError.name !== "AuthSessionMissingError") {
      throw new Error(`Unable to verify the current user: ${userError.message}`);
    }

    if (!user) {
      return redirectWithCookies(
        request,
        response,
        isAdminRoute ? "/admin/login" : "/login",
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Unable to verify the user's role: ${profileError.message}`);
    }

    if (!profile?.is_active) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(`Unable to sign out a deactivated account: ${signOutError.message}`);
      }
      return redirectWithCookies(request, response, "/login?error=account_disabled");
    }

    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
    if (isAdminRoute && !isAdmin) {
      return redirectWithCookies(request, response, "/dashboard");
    }
    if (isDashboardRoute && isAdmin) {
      return redirectWithCookies(request, response, "/admin");
    }
  }

  return response;
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  path: string,
) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
