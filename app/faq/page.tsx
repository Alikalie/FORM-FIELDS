import Link from "next/link";
import { Suspense } from "react";
import { PageIntro, PageShell } from "../components/site-chrome";
import { getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";

const questions = [
  ["Downloads", "Where do I download a template?", "Sign in and open a free template page to download it. Paid downloads will be available after checkout launches."],
  ["Free downloads", "Are free downloads really free?", "Yes. A listing marked Free has no purchase price. Signed-in customers can download up to three distinct free templates."],
  ["Purchases", "Can I buy a paid template right now?", "Not yet. Paid template pages are for browsing; checkout and payment processing are not connected, and no payment will be taken."],
  ["Editing", "Can I edit the template after downloading?", "Each listing describes its editable elements and supported file formats. Check those details before choosing a template."],
  ["Microsoft Office", "Do templates work with Microsoft Office?", "Some listings include Microsoft Word, Excel, or PowerPoint formats. Supported formats are listed individually on each template page."],
  ["Refunds", "What is your refund policy?", "Paid purchases are not enabled yet. Review the refund policy before checkout becomes available."],
  ["Account", "Can I create or access an account?", "Yes. Create an account or sign in to use your customer dashboard, downloads, favorites, and purchase history."],
  ["Payments", "Which payment methods do you accept?", "No payments are currently processed. Payment options will be shown before any checkout is enabled."],
];

async function FaqContent() {
  const content = await getPageContent(await createClient(), "faq");
  const editableQuestions = content.items
    ?.split(/\r?\n/)
    .map((item) => item.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 3 && parts.every(Boolean));
  const displayedQuestions = editableQuestions?.length ? editableQuestions : questions;
  return (
    <section className="inner-section faq-page">
        <PageIntro eyebrow={content.eyebrow || "A FEW GOOD ANSWERS"} title={content.title || "Frequently asked questions."} description={content.description || "Details on downloads, file formats, accounts, and what is available right now."} />
        <div className="faq-list">
          {displayedQuestions.map(([topic, question, answer]) => (
            <details className="faq-item" key={question}>
              <summary><span>{topic}</span><strong>{question}</strong><i aria-hidden="true">+</i></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <p className="faq-contact">Still have a question? <Link href="/contact">Contact us</Link>.</p>
    </section>
  );
}

export default function FaqPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section faq-page"><p role="status">Loading page content...</p></section>}>
        <FaqContent />
      </Suspense>
    </PageShell>
  );
}
