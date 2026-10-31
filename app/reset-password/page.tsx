import Link from "next/link";
import { FeedbackForm } from "../components/feedback-form";
import { BrandLogo, PageShell } from "../components/site-chrome";

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <section className="account-page">
        <div className="account-card">
          <BrandLogo className="account-brand" />
          <div className="eyebrow">ACCOUNT RECOVERY</div>
          <h1>Choose a new password.</h1>
          <p>Enter and confirm your new password to continue.</p>
          <FeedbackForm kind="reset-password" />
          <Link className="back-link account-back" href="/login">← Back to log in</Link>
        </div>
      </section>
    </PageShell>
  );
}
