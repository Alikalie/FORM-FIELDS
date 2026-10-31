import { Suspense } from "react";
import Link from "next/link";
import { AccountForm } from "../../components/account-form";
import { BrandLogo, PageShell } from "../../components/site-chrome";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function AdminLoginCard({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;
  const magicLinkNotice = {
    admin_only: "This account does not have administrator access.",
    admin_verification_failed: "We could not verify your admin role. Please try again.",
    magic_link_invalid: "This sign-in link is invalid or has expired. Request a new one.",
  }[error ?? ""];

  return (
    <section className="account-page">
      <div className="account-card">
        <BrandLogo className="account-brand" />
        <div className="eyebrow">ADMINISTRATOR ACCESS</div>
        <h1>Admin sign in</h1>
        <p>Sign in with an administrator account to open the control panel.</p>
        <AccountForm magicLinkNotice={magicLinkNotice} mode="admin-login" />
        <Link className="back-link account-back" href="/">← Back to the homepage</Link>
      </div>
    </section>
  );
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<section className="account-page" aria-busy="true" />}>
        <AdminLoginCard searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
