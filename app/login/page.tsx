import { Suspense } from "react";
import Link from "next/link";
import { AccountForm } from "../components/account-form";
import { BrandLogo, PageShell } from "../components/site-chrome";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

async function LoginCard({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const magicLinkNotice = {
    admin_only: "This account does not have administrator access.",
    admin_verification_failed: "We could not verify your admin role. Please try again.",
    magic_link_invalid: "This sign-in link is invalid or has expired. Request a new one.",
  }[error ?? ""];

  return (
    <section className="account-page">
      <div className="account-card">
        <BrandLogo className="account-brand" />
        <div className="eyebrow">WELCOME BACK</div>
        <h1>Good to see you.</h1>
        <p>Log in to pick up where your good ideas left off.</p>
        <AccountForm magicLinkNotice={magicLinkNotice} mode="login" nextPath={next} />
        <Link className="back-link account-back" href="/">← Back to the homepage</Link>
      </div>
    </section>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<section className="account-page" aria-busy="true" />}>
        <LoginCard searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
