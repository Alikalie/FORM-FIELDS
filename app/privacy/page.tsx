import { Suspense } from "react";
import { PageIntro, PageShell } from "../components/site-chrome";
import { PolicySections } from "../components/policy-sections";
import { ContentParagraphs, getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";

const privacySections = [
  {
    heading: "1. Information We Collect",
    paragraphs: ["Depending on how you use the website, we may collect the following information."],
    bullets: [
      "Account information: your name, email address, profile information you provide, and authentication information handled by our authentication provider.",
      "Usage information: templates viewed or downloaded, favorites, reviews, account activity, and basic technical information needed to operate and secure the service.",
      "Purchase information, when purchases are enabled: the template, amount, currency, payment status and provider, payment reference, and purchase date. We do not intend to store full payment-card information when a third-party provider processes payments.",
      "Messages and reviews: information you submit so we can respond, moderate content, and operate the service.",
    ],
  },
  {
    heading: "2. How We Use Information",
    paragraphs: ["We may use information to:"],
    bullets: [
      "Create and manage accounts and provide access to templates and downloads.",
      "Record purchases, manage favorites, moderate reviews, and respond to contact requests.",
      "Operate and improve the website, prevent abuse and fraud, and maintain account and website security.",
      "Comply with applicable legal obligations.",
    ],
    after: "We will not use personal information for unrelated purposes without an appropriate legal basis or permission where required.",
  },
  {
    heading: "3. Template Downloads",
    paragraphs: [
      "Some templates may be free and others may require purchase. We record downloads to apply free-download limits, provide download history, verify access rights, and protect files from unauthorized access. Private editable template files use access-controlled storage.",
    ],
  },
  {
    heading: "4. Information Sharing",
    paragraphs: [
      "We may use trusted providers for authentication, database and storage infrastructure, payment processing, website hosting, and security services. They receive information reasonably necessary to provide those services.",
      "We do not sell your personal information. We may disclose information when required by law, to protect our rights or users, or to investigate fraud, abuse, security incidents, or unlawful activity.",
    ],
  },
  {
    heading: "5. Data Security",
    paragraphs: [
      "We use reasonable technical and organizational safeguards, which may include authentication controls, database access controls and Row Level Security, server-side authorization, private storage for editable files, short-lived signed download links, role-based administrative access, and activity logging. No internet service can guarantee absolute security.",
    ],
  },
  {
    heading: "6. Account Information",
    paragraphs: ["Keep your account credentials confidential and notify us if you believe your account has been accessed without authorization."],
  },
  {
    heading: "7. Data Retention",
    paragraphs: [
      "We retain information for as long as reasonably necessary to provide the service, maintain records, resolve disputes, prevent fraud, enforce agreements, and meet applicable legal or operational requirements. When information is no longer reasonably required, we may delete or anonymize it, subject to applicable retention obligations.",
    ],
  },
  {
    heading: "8. Your Choices",
    paragraphs: [
      "Depending on applicable law, you may have rights concerning your personal information, including requesting access, correction, or deletion of certain information. Contact us with privacy questions or requests.",
    ],
  },
  {
    heading: "9. Children's Privacy",
    paragraphs: [
      "The service is not intentionally designed to collect personal information from children without appropriate authorization. If you believe a child has provided personal information improperly, contact us so we can review the situation.",
    ],
  },
  {
    heading: "10. International Service Providers",
    paragraphs: [
      "Some technical providers may process information in countries other than your country of residence. Where this occurs, we will take reasonable steps appropriate to the circumstances to protect information and use reputable providers.",
    ],
  },
  {
    heading: "11. Cookies",
    paragraphs: [
      "We use necessary cookies and similar technologies required for authentication and security. If we introduce analytics, advertising, or other non-essential tracking technologies, we will update this policy and provide appropriate choices where required. See our Cookie Policy for more information.",
    ],
  },
  {
    heading: "12. Changes to This Policy",
    paragraphs: ["We may update this policy when our services, technology, legal requirements, or data practices change. The latest version and update date will be posted here."],
  },
  {
    heading: "13. Contact",
    paragraphs: ["For privacy questions, account questions, or requests concerning your information, contact us through the Contact page or the contact details published on our website."],
  },
];

async function PrivacyContent() {
  const content = await getPageContent(await createClient(), "privacy");
  return (
    <section className="inner-section policy-page">
      <PageIntro
        eyebrow={content.eyebrow || "PRIVACY POLICY"}
        title={content.title || "Your information matters."}
        description={content.description || "This policy explains how Template Marketplace handles information when you use the website."}
      />
      {content.body
        ? <ContentParagraphs className="policy-copy" value={content.body} />
        : <PolicySections
            sections={privacySections}
            disclaimer="This is a website policy draft. It should be reviewed for the operating business, applicable jurisdictions, payment providers, and actual data-processing arrangements before launch."
          />}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section policy-page"><p role="status">Loading page content...</p></section>}>
        <PrivacyContent />
      </Suspense>
    </PageShell>
  );
}
