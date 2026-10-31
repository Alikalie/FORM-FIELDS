import { Suspense } from "react";
import { PageIntro, PageShell } from "../components/site-chrome";
import { PolicySections } from "../components/policy-sections";
import { ContentParagraphs, getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";

const termsSections = [
  {
    heading: "1. The Service",
    paragraphs: ["Template Marketplace provides downloadable editable document templates and related digital services. Templates may include CVs, resumes, invoices, business documents, presentations, certificates, and other editable materials."],
  },
  {
    heading: "2. User Accounts",
    paragraphs: ["Some features require an account. You agree to:"],
    bullets: ["Provide accurate information.", "Keep your login information secure and not share your account for unauthorized use.", "Notify us of suspected unauthorized access."],
    after: "We may suspend or terminate accounts involved in abuse, fraud, unauthorized access, or violation of these Terms.",
  },
  {
    heading: "3. Free Downloads",
    paragraphs: ["Eligible users may receive a limited number of free template downloads according to the current rules displayed on the website. Availability may depend on account status and abuse-prevention controls."],
  },
  {
    heading: "4. Paid Templates",
    paragraphs: ["Paid templates require payment before access is granted. The price displayed at checkout is the applicable price, subject to clearly stated taxes, fees, discounts, or promotions. A third-party payment provider may process payment."],
  },
  {
    heading: "5. Digital Products",
    paragraphs: ["Templates are digital products. After authorized access is granted, you may download and edit a template for your permitted personal or business use."],
  },
  {
    heading: "6. License and Restrictions",
    paragraphs: ["Unless a particular template states otherwise, purchasing or downloading a template gives you a limited right to use and edit it for your own permitted purposes. Without authorization, you may not:"],
    bullets: ["Resell the original template or redistribute its file as a competing product.", "Upload the template to another template marketplace or share private download links.", "Claim ownership of the original template design.", "Use the service to distribute unlawful content."],
  },
  {
    heading: "7. User Content",
    paragraphs: ["You are responsible for reviews, messages, and other content you submit. Do not submit content that is unlawful, abusive, fraudulent, threatening, defamatory, or infringes another person's rights. We may moderate or remove content that violates these rules."],
  },
  {
    heading: "8. Intellectual Property",
    paragraphs: ["The website, branding, software, original designs, text, graphics, and other materials provided by Template Marketplace may be protected by intellectual-property rights. Unauthorized copying or redistribution is prohibited."],
  },
  {
    heading: "9. Availability",
    paragraphs: ["We aim to keep the website available and functional but do not guarantee uninterrupted availability. Services may be unavailable because of maintenance, technical problems, security incidents, or circumstances outside our control."],
  },
  {
    heading: "10. Payments and Refunds",
    paragraphs: ["Payment and refund terms will be displayed when paid purchases are enabled. Refund eligibility may depend on the nature of the digital product, applicable law, and the circumstances of the request. See the Refund Policy for additional information."],
  },
  {
    heading: "11. Prohibited Activities",
    paragraphs: ["You must not:"],
    bullets: ["Attempt unauthorized access, circumvent security controls, or attack or disrupt the website.", "Abuse free-download limits, scrape private template files, or attempt to obtain another user's information.", "Upload malicious files or use the service for unlawful activity."],
  },
  {
    heading: "12. Termination",
    paragraphs: ["We may restrict or terminate access where reasonably necessary to protect the website, users, intellectual property, or service integrity."],
  },
  {
    heading: "13. Changes",
    paragraphs: ["We may update these Terms when the service or applicable requirements change. The latest version will be published on this page."],
  },
  {
    heading: "14. Contact",
    paragraphs: ["Questions concerning these Terms may be submitted through the Contact page or the contact information published on the website."],
  },
];

async function TermsContent() {
  const content = await getPageContent(await createClient(), "terms");
  return (
    <section className="inner-section policy-page">
      <PageIntro
        eyebrow={content.eyebrow || "TERMS OF SERVICE"}
        title={content.title || "The ground rules."}
        description={content.description || "These Terms govern your use of Template Marketplace."}
      />
      {content.body
        ? <ContentParagraphs className="policy-copy" value={content.body} />
        : <PolicySections
            sections={termsSections}
            disclaimer="These Terms are a website draft and should be reviewed by qualified legal counsel before commercial launch."
          />}
    </section>
  );
}

export default function TermsPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section policy-page"><p role="status">Loading page content...</p></section>}>
        <TermsContent />
      </Suspense>
    </PageShell>
  );
}
