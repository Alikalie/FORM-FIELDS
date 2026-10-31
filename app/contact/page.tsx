import { FeedbackForm } from "../components/feedback-form";
import { PageIntro, PageShell } from "../components/site-chrome";
import Link from "next/link";
import { getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function ContactContent() {
  const content = await getPageContent(await createClient(), "contact");
  return (
    <section className="inner-section contact-page">
        <PageIntro
          eyebrow={content.eyebrow || "GET IN TOUCH"}
          title={content.title || "How can we help?"}
          description={content.description || "Send a note about templates, downloads, or becoming a creator."}
        />
        <div className="contact-layout">
          <div className="contact-copy">
            <h2>{content.heading || "Here for the details."}</h2>
            <p>{content.body || "Find quick answers in the FAQ or tell us what you need using the contact form."}</p>
            <Link className="text-link" href="/faq">Visit frequently asked questions <span aria-hidden="true">→</span></Link>
            <p className="contact-status">Your message is saved securely in our database so the team can review and respond.</p>
          </div>
          <FeedbackForm kind="contact" />
        </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section contact-page"><p role="status">Loading page content...</p></section>}>
        <ContactContent />
      </Suspense>
    </PageShell>
  );
}
