import Link from "next/link";
import { FeedbackForm } from "../components/feedback-form";
import { BrandLogo, PageShell } from "../components/site-chrome";

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <section className="account-page">
        <div className="account-card">
          <BrandLogo className="account-brand" />
          <div className="eyebrow">ACCOUNT RECOVERY</div>
          <h1>Forgot your password?</h1>
          <p>Enter your email address to request a password reset link.</p>
          <FeedbackForm kind="forgot-password" />
          <Link className="back-link account-back" href="/login">← Back to log in</Link>
        </div>
      </section>
    </PageShell>
  );
}
