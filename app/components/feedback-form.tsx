"use client";

import { useActionState } from "react";
import { submitContactMessage } from "../actions/contact";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "../actions/auth";

export function FeedbackForm({
  kind,
}: {
  kind: "contact" | "forgot-password" | "reset-password";
}) {
  const [contactState, contactFormAction, contactPending] = useActionState(submitContactMessage, {});
  const [resetRequestState, resetRequestAction, resetRequestPending] = useActionState(
    requestPasswordResetAction,
    {},
  );
  const [updatePasswordState, updatePasswordFormAction, updatePasswordPending] = useActionState(
    updatePasswordAction,
    {},
  );
  const action = kind === "contact"
    ? contactFormAction
    : kind === "forgot-password"
      ? resetRequestAction
      : updatePasswordFormAction;
  const state = kind === "contact"
    ? contactState
    : kind === "forgot-password"
      ? resetRequestState
      : updatePasswordState;
  const pending = kind === "contact"
    ? contactPending
    : kind === "forgot-password"
      ? resetRequestPending
      : updatePasswordPending;

  return (
    <form action={action} className="account-form feedback-form">
      {kind === "contact" && (
        <label>
          Your name
          <input autoComplete="name" name="name" required />
        </label>
      )}
      {kind !== "reset-password" ? (
        <label>
          Email address
          <input autoComplete="email" name="email" required type="email" />
        </label>
      ) : (
        <>
          <label>
            New password
            <input autoComplete="new-password" minLength={8} name="password" required type="password" />
          </label>
          <label>
            Confirm new password
            <input autoComplete="new-password" minLength={8} name="confirmPassword" required type="password" />
          </label>
        </>
      )}
      {kind === "contact" && (
        <>
          <label>
            Topic
            <select defaultValue="general" name="topic">
              <option value="general">General question</option>
              <option value="download">Download help</option>
              <option value="purchase">Purchase question</option>
              <option value="creator">Creator inquiry</option>
            </select>
          </label>
          <label>
            How can we help?
            <textarea name="message" required rows={5} />
          </label>
        </>
      )}
      <button className="button button-primary account-submit" disabled={pending} type="submit">
        {pending
          ? "Sending..."
          : kind === "contact"
            ? "Send message"
            : kind === "forgot-password"
              ? "Request reset link"
              : "Update password"}
        <span aria-hidden="true">↗</span>
      </button>
      {state.error && <p className="account-notice" role="alert">{state.error}</p>}
      {state.message && <p className="account-notice" role="status">{state.message}</p>}
    </form>
  );
}
