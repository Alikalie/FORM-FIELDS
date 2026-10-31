import { Fragment, Suspense } from "react";
import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

const steps = [
  {
    number: "01",
    title: "Find your starting point",
    detail: "Browse a thoughtful collection of templates made for the work you do.",
  },
  {
    number: "02",
    title: "Make it your own",
    detail: "Customize the colors, copy, and details to fit your brand in minutes.",
  },
  {
    number: "03",
    title: "Get straight to work",
    detail: "Download your files and spend your time on what matters most.",
  },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TemplatePreview({ className }: { className: string }) {
  if (className === "preview-founder") {
    return (
      <div className={`template-preview ${className}`} aria-hidden="true">
        <div className="founder-sidebar"><span>F.</span><i /><i /><i /><i /></div>
        <div className="founder-page">
          <div className="founder-topline"><span>FIELDWORK STUDIO</span><span>2025 — 2026</span></div>
          <div className="founder-title">A better<br />kind of <em>everyday.</em></div>
          <div className="founder-bottom"><span>Brand<br />strategy</span><div className="founder-sun" /><span>01 — 12</span></div>
        </div>
      </div>
    );
  }

  if (className === "preview-social") {
    return (
      <div className={`template-preview ${className}`} aria-hidden="true">
        <div className="social-card social-card-one">
          <span className="social-label">A LITTLE<br />PAUSE</span>
          <div className="social-orb" />
          <span className="social-caption">GOOD THINGS TAKE TIME</span>
        </div>
        <div className="social-card social-card-two">
          <span className="social-caption">SUNDAY<br />STATE OF MIND</span>
          <div className="social-photo"><span /></div>
          <span className="social-tiny">ISSUE 04 · SPRING</span>
        </div>
        <div className="social-card social-card-three">
          <div className="social-flower">✳</div>
          <span className="social-label">MAKE ROOM<br />FOR GOOD.</span>
          <span className="social-tiny">A NOTE TO SELF — 04/12</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`template-preview ${className}`} aria-hidden="true">
      <div className="notes-cover">
        <div className="notes-stamp">FIELD<br />NOTES<br />NO. 08</div>
        <div className="notes-sun" />
        <div className="notes-horizon" />
        <span className="notes-title">A slower<br />way to grow.</span>
        <span className="notes-footer">A GUIDE TO DOING LESS, BETTER</span>
      </div>
      <div className="notes-page">
        <div className="notes-page-top">CONTENTS <span>02</span></div>
        <div className="notes-lines"><i /><i /><i /><i /></div>
        <div className="notes-leaf">✳</div>
        <span className="notes-page-number">FIELDWORK — 08</span>
      </div>
    </div>
  );
}

async function CategoriesSection() {
  const supabase = await createClient();
  const content = await getSiteContent(supabase, "homepage");
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("is_active", true)
    .order("name");

  return (
    <section className="section categories-section" id="categories">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{content["homepage.categories_eyebrow"] || "A GOOD PLACE TO BEGIN"}</div>
          <h2>{content["homepage.categories_heading"] || <>Popular categories.<br /><span>Possibilities included.</span></>}</h2>
        </div>
        <p>{content["homepage.categories_description"] || "Whatever you're working on, there's a starting point here that feels like you."}</p>
      </div>
      {error ? (
        <div className="mt-10 rounded-xl bg-red-50 p-6 text-red-700">
          Failed to load categories: {error.message}
        </div>
      ) : (
        <div className="category-grid">
          {categories?.map((category, index) => (
            <Link className="category-card" href={`/categories/${category.slug}`} key={category.id}>
              <div className={`category-icon category-icon-${String(index + 1).padStart(2, "0")}`}><span>{category.name.charAt(0)}</span><i /></div>
              <div className="category-info"><span>{String(index + 1).padStart(2, "0")} / CATEGORY</span><h3>{category.name}</h3>{category.description && <p>{category.description}</p>}</div>
              <span className="category-arrow"><ArrowIcon diagonal /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CategoriesFallback() {
  return (
    <section className="section categories-section" id="categories">
      <div className="section-heading">
        <div><div className="eyebrow">A GOOD PLACE TO BEGIN</div><h2>Popular categories.<br /><span>Possibilities included.</span></h2></div>
        <p>Whatever you&apos;re working on, there&apos;s a starting point here that feels like you.</p>
      </div>
      <p className="category-grid" role="status">Loading categories...</p>
    </section>
  );
}

async function FeaturedTemplates() {
  const supabase = await createClient();
  const content = await getSiteContent(supabase, "homepage");
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true);

  if (categoryError) {
    return <p className="mt-10 rounded-xl bg-red-50 p-6 text-red-700">Failed to load templates: {categoryError.message}</p>;
  }

  const categoryIds = (categories ?? []).map((category) => category.id);
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const { data: featured, error } = categoryIds.length
    ? await supabase
        .from("templates")
        .select("id, title, slug, short_description, price, currency, is_free, is_featured, category_id, created_at")
        .eq("is_published", true)
        .in("category_id", categoryIds)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [], error: null };

  if (error) {
    return <p className="mt-10 rounded-xl bg-red-50 p-6 text-red-700">Failed to load templates: {error.message}</p>;
  }

  const previewClasses = ["preview-founder", "preview-social", "preview-notes"];

  return (
    <section className="section featured-section" id="templates">
      <div className="featured-heading">
        <div>
          <div className="eyebrow">{content["homepage.featured_eyebrow"] || "THE GOOD STUFF"}</div>
          <h2>{content["homepage.featured_heading"] || <>Made to make<br /><span>your work shine.</span></>}</h2>
        </div>
        <Link className="text-link" href="/templates">{content["homepage.featured_link"] || "Explore all templates"} <ArrowIcon /></Link>
      </div>
      {featured?.length ? (
        <div className="template-grid">
          {featured.map((template, index) => {
            const categoryName = categoryNames.get(template.category_id) || "Template";
            const price = template.is_free || Number(template.price ?? 0) === 0
              ? "Free"
              : new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: template.currency || "USD",
                }).format(Number(template.price));
            const className = previewClasses[index % previewClasses.length];

            return (
              <article className="template-card" key={template.id}>
                <Link className={`template-cover ${className}`} href={`/templates/${template.slug}`} aria-label={`Learn more about ${template.title}`}>
                  <TemplatePreview className={className} />
                  <span className="save-button" aria-hidden="true">↗</span>
                </Link>
                <div className="template-meta"><span>{categoryName.toUpperCase()}</span></div>
                <div className="template-title-row"><h3>{template.title}</h3><span>{price}</span></div>
                <p className="template-creator">{template.short_description || "A thoughtful template, ready to make your own."}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-collection"><p>No published templates are available yet. Check back soon.</p></div>
      )}
    </section>
  );
}

async function HomepageHeroCopy() {
  const content = await getSiteContent(await createClient(), "homepage");
  const titlePrefix = content["homepage.hero_title_prefix"] || "Make room for\nyour";
  const titleEmphasis = content["homepage.hero_title_emphasis"] || "best ideas.";

  return (
    <>
      <h1>
        {titlePrefix.split("\n").map((line, index) => (
          <Fragment key={`${index}-${line}`}>
            {index > 0 && <br />}
            {line}
          </Fragment>
        ))}{" "}
        <span>{titleEmphasis}</span>
      </h1>
      <p className="hero-description">
        {content["homepage.hero_description"] ||
          "Thoughtful templates for the work you can't wait to put into the world. Less starting from scratch, more making it yours."}
      </p>
    </>
  );
}

function FeaturedTemplatesFallback() {
  return (
    <section className="section featured-section" id="templates">
      <div className="section-heading"><h2>Loading the collection...</h2></div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> GOOD WORK STARTS HERE</div>
            <Suspense fallback={<div className="hero-copy-loading" aria-hidden="true" />}>
              <HomepageHeroCopy />
            </Suspense>
            <div className="hero-actions">
              <Link className="button button-primary" href="/templates">Find your template <ArrowIcon /></Link>
              <Link className="text-link" href="/how-it-works">See how it works <ArrowIcon /></Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>R</span></div>
              <p><strong>Made for people who make.</strong><br />Join 12,000+ creative minds</p>
            </div>
          </div>

          <div className="hero-art" aria-label="A preview of an editorial brand template">
            <div className="art-grid" />
            <div className="floating-note note-top"><span className="note-icon">✳</span><span><strong>Made with intention</strong><small>Designed for your next big thing</small></span></div>
            <div className="hero-sheet">
              <div className="sheet-top"><span>F<span className="sheet-dot">.</span>F</span><span>INDEPENDENT BY DESIGN</span></div>
              <div className="sheet-image"><div className="sheet-sun" /><div className="sheet-arch" /><div className="sheet-ground" /></div>
              <div className="sheet-copy"><span>THE CREATIVE PRACTICE SERIES · NO. 01</span><strong>Good things<br />take <em>shape.</em></strong><div><i /><span>WORKBOOK / 2025</span></div></div>
            </div>
            <div className="floating-note note-bottom"><span className="download-icon">↓</span><span><strong>Ready when you are</strong><small>Instant download · yours to keep</small></span></div>
            <div className="hero-sticker">YOUR NEXT<br />CHAPTER<br /><span>STARTS HERE ↗</span></div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Marketplace highlights">
          <span>GOOD DESIGN, GOOD TO GO</span><i /><span>MADE BY INDEPENDENT CREATORS</span><i /><span>YOURS TO MAKE YOUR OWN</span><i /><span>NO SUBSCRIPTION REQUIRED</span>
        </section>

        <Suspense fallback={<FeaturedTemplatesFallback />}>
          <FeaturedTemplates />
        </Suspense>

        <Suspense fallback={<CategoriesFallback />}>
          <CategoriesSection />
        </Suspense>

        <section className="how-section" id="how-it-works">
          <div className="how-inner">
            <div className="how-intro">
              <div className="eyebrow eyebrow-light">SIMPLE BY DESIGN</div>
              <h2>From “where do I start?”<br />to <em>“look what I made.”</em></h2>
              <p>Good work deserves a good beginning. We make the first step the easy one.</p>
              <Link className="button button-light" href="/templates">Browse the collection <ArrowIcon /></Link>
            </div>
            <div className="steps-list">
              {steps.map((step) => (
                <div className="step-item" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.detail}</p></div>
                  <span className="step-check">↗</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section why-section" id="why-us">
          <div className="why-heading"><div className="eyebrow">THE FORM & FIELD DIFFERENCE</div><h2>Good work, without<br /><span>the busywork.</span></h2></div>
          <div className="why-grid">
            <article className="why-card why-card-blue"><div className="why-mark">✳</div><h3>Considered, not cookie-cutter.</h3><p>Every template is handpicked from independent designers who care about the details as much as you do.</p></article>
            <article className="why-card why-card-cream"><div className="why-mark">↗</div><h3>Yours from the first click.</h3><p>Pay once, download instantly, and make it your own. No subscriptions, no hoops, no funny business.</p></article>
            <article className="why-card why-card-lilac"><div className="why-mark">✴</div><h3>More time for the good stuff.</h3><p>Start with the bones of something beautiful, then spend your energy making it uniquely yours.</p></article>
          </div>
        </section>

        <section className="free-promo">
          <div className="free-promo-art" aria-hidden="true">
            <div className="free-promo-sheet">
              <span>FORM &amp; FIELD · FREE RESOURCE</span>
              <strong>Start with<br /><em>a first draft.</em></strong>
              <i /><small>THE ONE-PAGE IDEA WORKSHEET</small>
            </div>
            <span className="free-promo-sticker">ON US<br />✳</span>
          </div>
          <div className="free-promo-copy">
            <div className="eyebrow">A LITTLE SOMETHING, ON US</div>
            <h2>Good ideas deserve<br /><span>a first draft.</span></h2>
            <p>Get our free, printable idea worksheet. A simple page to gather your thoughts, find your focus, and make your next move.</p>
            <Link className="button button-primary" href="/templates/free">
              Explore free downloads <ArrowIcon />
            </Link>
            <span className="free-promo-note">FREE TO DOWNLOAD · NO PURCHASE NEEDED</span>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-orb cta-orb-one" /><div className="cta-orb cta-orb-two" />
          <div className="eyebrow eyebrow-light">YOUR NEXT GOOD IDEA IS WAITING</div>
          <h2>Let&apos;s make something<br /><em>worth putting out there.</em></h2>
          <p>Find a template that feels like a beginning.</p>
          <Link className="button button-light" href="/signup">Create your free account <ArrowIcon /></Link>
          <span className="cta-footnote">MADE FOR THE WORK THAT MOVES YOU.</span>
        </section>
      </main>

      <Suspense fallback={<div className="site-footer-loading" aria-hidden="true" />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
