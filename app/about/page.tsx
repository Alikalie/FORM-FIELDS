import Link from "next/link";
import { Suspense } from "react";
import { getPageContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { PageIntro, PageShell } from "../components/site-chrome";

const principles = [
  ["The blank-page problem", "Starting from nothing can turn a good idea into hours of setup. It is often hard to know what to make first, or how to make it look and feel finished."],
  ["A better first step", "Form & Field brings together ready-to-customize templates, clear file details, and free resources so you can begin with a useful structure instead of a blank page."],
  ["Made for people who make", "The marketplace is designed for independent professionals, small businesses, educators, teams, and anyone who needs a considered starting point for their work."],
  ["Useful by design", "Templates are meant to be adaptable: understand what is included, see which formats are supported, and decide whether the file suits your project before you download."],
];

async function AboutContent() {
  const content = await getPageContent(await createClient(), "about");
  return (
    <section className="inner-section about-page">
        <PageIntro eyebrow={content.eyebrow || "OUR STORY"} title={content.title || "A thoughtful place to begin."} description={content.description || "A marketplace for considered templates and the people with ideas to put them to work."} />
        {content.body ? (
          <div className="about-principles">
            {content.body.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => (
              <article key={`${index}-${line}`}><span>{String(index + 1).padStart(2, "0")}</span><div><p>{line}</p></div></article>
            ))}
          </div>
        ) : (
          <div className="about-principles">
            {principles.map(([title, detail], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{title}</h2><p>{detail}</p></div>
              </article>
            ))}
          </div>
        )}
        <div className="about-cta"><p>Ready to find your starting point?</p><Link className="button button-primary" href="/templates">Explore templates <span aria-hidden="true">→</span></Link></div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section about-page"><p role="status">Loading page content...</p></section>}>
        <AboutContent />
      </Suspense>
    </PageShell>
  );
}
