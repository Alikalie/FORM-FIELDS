import Link from "next/link";
import { Suspense } from "react";
import { AccountForm } from "../components/account-form";
import { BrandLogo, PageShell } from "../components/site-chrome";

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

async function SignupCard({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;
  return (
    <section className="account-page">
      <div className="account-card">
        <BrandLogo className="account-brand" />
        <div className="eyebrow">MAKE ROOM FOR GOOD IDEAS</div>
        <h1>Your next chapter starts here.</h1>
        <p>Create an account to keep your favorite finds close.</p>
        <AccountForm mode="signup" nextPath={next} />
        <p className="account-privacy-notice">
          By creating an account, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and acknowledge our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <Link className="back-link account-back" href="/">← Back to the homepage</Link>
      </div>
    </section>
  );
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<section className="account-page" aria-busy="true" />}>
        <SignupCard searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
