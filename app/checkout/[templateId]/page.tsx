import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "../../components/site-chrome";

type CheckoutPageProps = {
  params: Promise<{ templateId: string }>;
};

function formatMoney(amount: number, currency: string | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

async function CheckoutContent({ templateId }: { templateId: string }) {
  const account = await getAuthenticatedProfile();

  if (!account) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${templateId}`)}`);
  }

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("templates")
    .select("id, title, slug, price, currency, is_free, is_published, short_description")
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the template for checkout: ${error.message}`);
  }

  if (!template || !template.is_published) {
    notFound();
  }

  const unitPrice = template.is_free || Number(template.price ?? 0) === 0 ? 0 : Number(template.price ?? 0);
  const total = unitPrice;
  const customerName = account.fullName || account.user.email?.split("@")[0] || "Customer";
  const customerEmail = account.user.email || "";

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <div className="eyebrow">SECURE CHECKOUT</div>
        <h1>Complete your order</h1>
      </div>

      <div className="checkout-layout">
        <div className="checkout-card">
          <h2>Your Information</h2>
          <div className="checkout-field-group">
            <label className="checkout-field">
              <span>Full Name</span>
              <input defaultValue={customerName} readOnly type="text" />
            </label>

            <label className="checkout-field">
              <span>Email Address</span>
              <input defaultValue={customerEmail} readOnly type="email" />
            </label>
          </div>
        </div>

        <aside className="checkout-card checkout-summary-card">
          <h2>Order Summary</h2>

          <div className="checkout-line-item">
            <div>
              <strong>{template.title}</strong>
              <small>{template.short_description || "Digital template download"}</small>
            </div>
            <span>{unitPrice === 0 ? "Free" : formatMoney(unitPrice, template.currency)}</span>
          </div>

          <div className="checkout-total-row">
            <span>Price</span>
            <strong>{unitPrice === 0 ? "Free" : formatMoney(unitPrice, template.currency)}</strong>
          </div>

          <div className="checkout-total-row final">
            <span>Total</span>
            <strong>{unitPrice === 0 ? "Free" : formatMoney(total, template.currency)}</strong>
          </div>

          {unitPrice === 0 ? (
            <div className="checkout-actions">
              <Link className="button button-primary" href={`/templates/${template.slug}`}>
                View template <span aria-hidden="true">→</span>
              </Link>
              <p className="checkout-note">This template is free and does not require checkout.</p>
            </div>
          ) : (
            <div className="checkout-actions">
              <button className="button button-primary" disabled type="button">
                Payment unavailable
              </button>
              <p className="checkout-note" role="status">
                Online payment is not configured yet. No payment or purchase has been recorded.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<section className="checkout-page"><p role="status">Loading checkout...</p></section>}>
        {params.then(({ templateId }) => <CheckoutContent templateId={templateId} />)}
      </Suspense>
    </PageShell>
  );
}
