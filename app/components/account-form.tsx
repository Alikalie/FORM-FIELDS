"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  adminLoginAction,
  loginAction,
  requestAdminMagicLinkAction,
  signupAction,
} from "../actions/auth";
import type { AccountActionState } from "../actions/auth";

function PasswordField({
  autoComplete,
  label,
  minLength,
  name,
}: {
  autoComplete: string;
  label: string;
  minLength?: number;
  name: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label>
      {label}
      <span className="password-input-wrap">
        <input
          autoComplete={autoComplete}
          minLength={minLength}
          name={name}
          required
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="password-visibility-toggle"
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        >
          {isVisible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 8.6 5.2 8.6 7a8.8 8.8 0 01-2.1 3.1M6.2 6.2C3.9 7.7 2.4 10.2 2.4 12c0 1.8 3.4 7 9.6 7 1.4 0 2.7-.3 3.8-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M2.4 12s3.4-7 9.6-7 9.6 7 9.6 7-3.4 7-9.6 7-9.6-7-9.6-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}

export function AccountForm({
  magicLinkNotice,
  mode,
  nextPath,
}: {
  magicLinkNotice?: string;
  mode: "login" | "signup" | "admin-login";
  nextPath?: string;
}) {
  const isSignup = mode === "signup";
  const isAdminLogin = mode === "admin-login";
  const action = isSignup
    ? signupAction
    : isAdminLogin
      ? adminLoginAction
      : loginAction;
  const [state, formAction, isPending] = useActionState<AccountActionState, FormData>(
    action,
    {},
  );
  const [magicLinkState, magicLinkFormAction, isMagicLinkPending] = useActionState<
    AccountActionState,
    FormData
  >(requestAdminMagicLinkAction, {});

  return (
    <>
      <form action={formAction} className="account-form">
        {nextPath && <input name="next" type="hidden" value={nextPath} />}
        {isSignup && (
          <label>
            Full name
            <input autoComplete="name" name="name" required />
          </label>
        )}
        <label>
          Email address
          <input
            autoComplete="email"
            name="email"
            required
            type="email"
          />
        </label>
        <PasswordField
          autoComplete={isSignup ? "new-password" : "current-password"}
          label="Password"
          minLength={isSignup ? 8 : undefined}
          name="password"
        />
        {isSignup && (
          <PasswordField
            autoComplete="new-password"
            label="Confirm password"
            minLength={8}
            name="confirmPassword"
          />
        )}
        {isSignup && (
          <label className="account-agreement">
            <input name="agreement" required type="checkbox" />
            <span>
              I agree to the <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>
            </span>
          </label>
        )}
        <button className="button button-primary account-submit" disabled={isPending} type="submit">
          {isPending
            ? "Please wait..."
            : isSignup
              ? "Create your account"
              : isAdminLogin
                ? "Sign in to admin"
                : "Log in"}
          <span aria-hidden="true">↗</span>
        </button>
        {state.error && <p className="account-notice" role="alert">{state.error}</p>}
        {!isSignup && (
          <Link className="forgot-password-link" href="/forgot-password">
            Forgot password?
          </Link>
        )}
        <p className="account-switch">
          {isAdminLogin
            ? <>Customer? <Link href="/login">Go to customer login</Link></>
            : <>{isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                <Link href={`${isSignup ? "/login" : "/signup"}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
                  {isSignup ? "Log in" : "Create one"}
                </Link>
              </>}
        </p>
        {isSignup && (
          <Link className="account-secondary-action" href="/verify-email">
            Already signed up? Verify your email
          </Link>
        )}
      </form>
      {isAdminLogin && (
        <form action={magicLinkFormAction} className="account-form magic-link-form">
          <div className="account-divider"><span>OR</span></div>
          <p>Admin? Get a secure, passwordless sign-in link by email.</p>
          {magicLinkNotice && (
            <p className="account-notice" role="alert">{magicLinkNotice}</p>
          )}
          <label>
            Admin email address
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <button
            className="button button-secondary account-submit"
            disabled={isMagicLinkPending}
            type="submit"
          >
            {isMagicLinkPending ? "Sending link..." : "Email me an admin sign-in link"}
          </button>
          {magicLinkState.error && (
            <p className="account-notice" role="alert">{magicLinkState.error}</p>
          )}
          {magicLinkState.message && (
            <p className="account-notice" role="status">{magicLinkState.message}</p>
          )}
        </form>
      )}
    </>
  );
}
