"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/supabase/auth";

export type AccountActionState = {
  error?: string;
  message?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPostLoginPath(formData: FormData) {
  const nextPath = getString(formData, "next");
  return /^\/checkout\/[a-zA-Z0-9-]+$/.test(nextPath) ||
    /^\/downloads\/templates\/[\da-f-]{36}$/i.test(nextPath) ||
    /^\/templates\/[a-z0-9-]+$/i.test(nextPath) ||
    nextPath === "/downloads/free-worksheet"
    ? nextPath
    : undefined;
}

export async function signupAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const fullName = getString(formData, "name");
  const email = getString(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Complete all fields to create your account." };
  }
  if (password.length < 8) {
    return { error: "Your password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please check both password fields." };
  }
  if (formData.get("agreement") !== "on") {
    return { error: "Please agree to the Terms of Service and acknowledge the Privacy Policy to continue." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect(getPostLoginPath(formData) || "/dashboard");
  }

  redirect("/verify-email?sent=1");
}

export async function loginAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = getString(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Unable to log in. Check your email and password, then try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Unable to sign out after profile verification failed: ${signOutError.message}`);
    }

    return {
      error: "Your account role could not be verified. Please try again.",
    };
  }

  if (!profile || !profile.is_active) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw new Error(`Unable to sign out a deactivated account: ${signOutError.message}`);
    return { error: "This account is deactivated. Contact support for assistance." };
  }

  redirect(
    isAdminRole(profile.role ?? "user")
      ? "/admin"
      : getPostLoginPath(formData) || "/dashboard",
  );
}

export async function adminLoginAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = getString(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your administrator email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Unable to sign in. Check your email and password, then try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active || !isAdminRole(profile.role)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Unable to sign out after admin access was denied: ${signOutError.message}`);
    }

    return {
      error: profileError
        ? "Your administrator role could not be verified. Please try again."
        : "This account does not have administrator access.",
    };
  }

  redirect("/admin");
}

export async function requestAdminMagicLinkAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = getString(formData, "email");
  if (!email) {
    return { error: "Enter the email address for your admin account." };
  }

  const supabase = await createClient();
  const requestOrigin = (await headers()).get("origin");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;
  if (!origin) {
    return { error: "Unable to determine the sign-in link address. Please try again." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: new URL("/auth/callback?flow=admin", origin).toString(),
    },
  });

  if (error) {
    return { error: "Unable to send a sign-in link. Check the email address and try again." };
  }

  return {
    message: "If this email belongs to an existing account, a sign-in link has been sent.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = getString(formData, "email").toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const requestOrigin = (await headers()).get("origin");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;
  if (!origin) {
    return { error: "Unable to determine the password reset link address. Please try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?flow=recovery", origin).toString(),
  });
  if (error) return { error: `Unable to request a password reset: ${error.message}` };

  return {
    message: "If an account exists for that address, a password reset link has been sent.",
  };
}

export async function updatePasswordAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8) {
    return { error: "Your password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please check both password fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Your reset link is invalid or expired. Request a new one and try again." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: `Unable to update your password: ${error.message}` };

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    throw new Error(`Password updated, but unable to end the recovery session: ${signOutError.message}`);
  }

  redirect("/login?password_updated=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to log out: ${error.message}`);
  }

  redirect("/");
}
