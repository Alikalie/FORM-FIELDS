import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "../../../components/site-chrome";

type SuccessPageProps = {
  params: Promise<{ templateId: string }>;
};

async function CheckoutSuccessContent({ templateId }: { templateId: string }) {
  const account = await getAuthenticatedProfile();

  if (!account) {
    return (
      <section className="checkout-page">
        <div className="checkout-header">
          <div className="eyebrow">ACCESS REQUIRED</div>
          <h1>Please sign in to continue.</h1>
        </div>
        <Link className="button button-primary" href="/login">Go to login</Link>
      </section>
    );
  }

  const { data: purchase, error: purchaseError } = await account.supabase
    .from("purchases")
    .select("id, status, amount, currency")
    .eq("user_id", account.user.id)
    .eq("template_id", templateId)
    .eq("status", "paid")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (purchaseError) {
    throw new Error(`Unable to verify the purchase: ${purchaseError.message}`);
  }

  if (!purchase) {
    return (
      <section className="checkout-page">
        <div className="checkout-header">
          <div className="eyebrow">PAYMENT NOT CONFIRMED</div>
          <h1>We could not verify this purchase.</h1>
          <p>Your account has not been granted download access.</p>
        </div>
        <Link className="button button-primary" href={`/checkout/${templateId}`}>
          Return to checkout
        </Link>
      </section>
    );
  }

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("templates")
    .select("id, title, slug")
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the completed purchase: ${error.message}`);
  }

  if (!template) {
    notFound();
  }

  const customerName = account.fullName || account.user.email?.split("@")[0] || "Customer";

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <div className="eyebrow">PAYMENT CONFIRMED</div>
        <h1>Your purchase is complete</h1>
      </div>

      <div className="checkout-layout">
        <div className="checkout-card">
          <h2>Thanks for your order, {customerName}</h2>
          <p className="checkout-note">
            Your paid purchase has been verified and recorded in your account.
          </p>
          <div className="checkout-field-group">
            <div className="checkout-field">
              <span>Template</span>
              <strong>{template.title}</strong>
            </div>
            <div className="checkout-field">
              <span>Amount</span>
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: purchase.currency || "USD",
                }).format(Number(purchase.amount))}
              </strong>
            </div>
          </div>
          <div className="checkout-actions">
            <p className="checkout-note" role="status">
              Your purchase is recorded. A download file has not been configured for this template yet.
            </p>
            <Link className="button button-secondary" href={`/templates/${template.slug}`}>
              View template
            </Link>
          </div>
        </div>

        <aside className="checkout-card checkout-summary-card">
          <h2>What happens next</h2>
          <ul className="dashboard-list dashboard-activity-list">
            <li><span className="dashboard-activity-icon"><span>✓</span></span><span>Purchase recorded in your account</span></li>
            <li><span className="dashboard-activity-icon"><span>✓</span></span><span>Template is available for download</span></li>
            <li><span className="dashboard-activity-icon"><span>✓</span></span><span>You can review it from your dashboard anytime</span></li>
          </ul>
          <Link className="text-link" href="/dashboard">Go to dashboard <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage({ params }: SuccessPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<section className="checkout-page"><p role="status">Loading confirmation...</p></section>}>
        {params.then(({ templateId }) => <CheckoutSuccessContent templateId={templateId} />)}
      </Suspense>
    </PageShell>
  );
}
