import { PageIntro, PageShell } from "../components/site-chrome";
import Link from "next/link";
import { ContentParagraphs, getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function RefundPolicyContent() {
  const content = await getPageContent(await createClient(), "refund-policy");
  return (
    <section className="inner-section policy-page">
        <PageIntro
          eyebrow={content.eyebrow || "REFUNDS"}
          title={content.title || "A clear policy before checkout."}
          description={content.description || "This marketplace is not processing purchases yet."}
        />
        {content.body ? <ContentParagraphs className="policy-copy" value={content.body} /> : <div className="policy-copy">
          <p><strong>Current status.</strong> Paid templates are displayed for browsing only. Checkout and payment processing are not active, so no paid orders are being accepted and there are currently no marketplace purchases to refund.</p>
          <p><strong>Free downloads.</strong> Free files do not require payment and are not eligible for a refund.</p>
          <p><strong>Before purchases launch.</strong> This policy will be reviewed and updated with the applicable request process and terms before paid checkout is enabled.</p>
          <p><strong>Questions.</strong> Use the <Link href="/contact">contact page</Link> for general inquiries. The contact form is currently a preview and does not send messages.</p>
        </div>}
    </section>
  );
}

export default function RefundPolicyPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section policy-page"><p role="status">Loading page content...</p></section>}>
        <RefundPolicyContent />
      </Suspense>
    </PageShell>
  );
}
