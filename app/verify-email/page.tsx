import Link from "next/link";
import { BrandLogo, PageShell } from "../components/site-chrome";

export default function VerifyEmailPage() {
  return (
    <PageShell>
      <section className="account-page">
        <div className="account-card">
          <BrandLogo className="account-brand" />
          <div className="eyebrow">EMAIL CONFIRMATION</div>
          <h1>Check your inbox.</h1>
          <p>
            If email confirmation is enabled, follow the link we sent you to
            finish creating your account. Once confirmed, you can log in.
          </p>
          <Link className="button button-primary verify-button" href="/login">
            Continue to log in
          </Link>
          <Link className="back-link account-back" href="/">← Back to the homepage</Link>
        </div>
      </section>
    </PageShell>
  );
}
