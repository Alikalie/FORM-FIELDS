import { Suspense } from "react";
import { PolicySections } from "../components/policy-sections";
import { PageIntro, PageShell } from "../components/site-chrome";
import { ContentParagraphs, getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";

const cookieSections = [
  {
    heading: "1. What Are Cookies?",
    paragraphs: ["Cookies are small pieces of information stored by a website in a user's browser. They can help a website remember a session, maintain security, and provide requested functionality."],
  },
  {
    heading: "2. Necessary Cookies",
    paragraphs: ["We may use necessary cookies for purposes such as:"],
    bullets: ["Keeping users signed in and maintaining secure authentication sessions.", "Protecting authenticated pages and supporting security features.", "Maintaining essential website functionality."],
    after: "These cookies are necessary for the operation of the service.",
  },
  {
    heading: "3. Optional Cookies",
    paragraphs: ["At this time, Template Marketplace does not need optional advertising or marketing cookies to provide its core functionality. If we introduce optional analytics, advertising, or marketing cookies, we will update this policy and provide appropriate controls where required."],
  },
  {
    heading: "4. Third-Party Services",
    paragraphs: ["Some services used to operate the website may use cookies or similar technologies. Authentication, payment, analytics, hosting, or security providers may have their own technology and privacy practices. Review the applicable third-party policies when relevant."],
  },
  {
    heading: "5. Managing Cookies",
    paragraphs: ["You can manage or delete cookies through your browser settings. Disabling necessary cookies may prevent parts of the website, particularly authentication and account features, from working correctly."],
  },
  {
    heading: "6. Changes to This Policy",
    paragraphs: ["We may update this Cookie Policy when our technology or services change. The latest version and update date will be posted here."],
  },
  {
    heading: "7. Contact",
    paragraphs: ["If you have questions about cookies or privacy, contact us through the website's Contact page."],
  },
];

async function CookiePolicyContent() {
  const content = await getPageContent(await createClient(), "cookies");
  return (
    <section className="inner-section policy-page">
      <PageIntro
        eyebrow={content.eyebrow || "COOKIE POLICY"}
        title={content.title || "Cookies and essential functionality."}
        description={content.description || "This policy explains how Template Marketplace uses cookies and similar technologies."}
      />
      {content.body
        ? <ContentParagraphs className="policy-copy" value={content.body} />
        : <PolicySections
            sections={cookieSections}
            disclaimer="This Cookie Policy is a website draft and should be reviewed against the final technologies used by the website before launch."
          />}
    </section>
  );
}

export default function CookiesPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section policy-page"><p role="status">Loading page content...</p></section>}>
        <CookiePolicyContent />
      </Suspense>
    </PageShell>
  );
}
