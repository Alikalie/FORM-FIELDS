"use client";

import { useActionState } from "react";
import { submitReviewAction } from "@/app/actions/customer";

export function ReviewForm({ templateId }: { templateId: string }) {
  const [state, formAction, isPending] = useActionState(submitReviewAction, null);

  return (
    <form action={formAction} className="template-review-form" id="review-form">
      {state?.status === "success" ? (
        <p className="template-review-success" role="status">{state.message}</p>
      ) : (
        <>
          <input name="template_id" type="hidden" value={templateId} />
          <label>
            <span>Your rating</span>
            <select defaultValue="5" name="rating" required>
              <option value="5">5 stars — Excellent</option>
              <option value="4">4 stars — Very good</option>
              <option value="3">3 stars — Good</option>
              <option value="2">2 stars — Fair</option>
              <option value="1">1 star — Poor</option>
            </select>
          </label>
          <label>
            <span>Your review</span>
            <textarea
              maxLength={5000}
              minLength={1}
              name="body"
              placeholder="What did you think of this template?"
              required
              rows={5}
            />
          </label>
          {state?.status === "error" && (
            <p className="template-review-error" role="alert">{state.message}</p>
          )}
          <button className="button button-primary" disabled={isPending} type="submit">
            {isPending ? "Submitting..." : "Submit review"}
          </button>
        </>
      )}
    </form>
  );
}
