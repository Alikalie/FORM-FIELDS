import Link from "next/link";
import { ContentParagraphs, getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { PageIntro, PageShell } from "../components/site-chrome";
import { Suspense } from "react";

const steps = [
  ["01", "Find a good starting point", "Browse thoughtful templates from independent creators, organized around the work you want to do."],
  ["02", "Make it feel like yours", "Choose a design that fits your idea, then personalize the details to make it your own."],
  ["03", "Get on with the good work", "Use your template as a springboard and put your time into the ideas only you can bring to life."],
];

async function HowItWorksContent() {
  const content = await getPageContent(await createClient(), "how-it-works");
  return (
    <section className="inner-section how-page">
        <PageIntro
          eyebrow={content.eyebrow || "SIMPLE BY DESIGN"}
          title={content.title || "A little less setup. A lot more making."}
          description={content.description || "Getting started shouldn’t be the hardest part. Form & Field gives good ideas a thoughtful first step."}
        />
        {content.body ? (
          <div className="policy-copy"><ContentParagraphs value={content.body} /></div>
        ) : (
          <div className="how-page-steps">
            {steps.map(([number, title, detail], index) => {
              const editableStep = content.items?.split(/\r?\n/)[index]?.split("|").map((part) => part.trim());
              const [stepTitle, stepDetail] = editableStep?.length === 2 ? editableStep : [title, detail];
              return (
                <article className="how-page-step" key={number}>
                  <span>{number}</span>
                  <div><h2>{stepTitle}</h2><p>{stepDetail}</p></div>
                  <i aria-hidden="true">↗</i>
                </article>
              );
            })}
          </div>
        )}
        <Link className="button button-primary" href="/templates">Explore templates <span aria-hidden="true">→</span></Link>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section how-page"><p role="status">Loading page content...</p></section>}>
        <HowItWorksContent />
      </Suspense>
    </PageShell>
  );
}
