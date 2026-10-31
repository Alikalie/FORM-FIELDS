import { Suspense } from "react";
import Link from "next/link";
import { getAuthenticatedProfile, isAdminRole } from "@/lib/supabase/auth";
import { getSafeSocialUrl, getSiteContent } from "@/lib/site-content";
import { createClient } from "@/lib/supabase/server";
import { SiteHeaderNavigation } from "./site-header-navigation";

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      className={`brand${className ? ` ${className}` : ""}`}
      href="/"
      aria-label="Form & Field home"
    >
      <LogoMark />
      <span>
        form<span className="brand-amp">&</span>field
      </span>
    </Link>
  );
}

async function AuthenticatedSiteHeader() {
  const account = await getAuthenticatedProfile();
  const supabase = account?.supabase ?? await createClient();
  const navigation = await getSiteContent(supabase, "navigation");
  const dashboardHref = account
    ? isAdminRole(account.role)
      ? "/admin"
      : "/dashboard"
    : undefined;
  return (
    <SiteHeaderNavigation
      brand={<BrandLogo />}
      dashboardHref={dashboardHref}
      labels={{
        templates: navigation["navigation.templates"] || "Templates",
        categories: navigation["navigation.categories"] || "Categories",
        howItWorks: navigation["navigation.how_it_works"] || "How it works",
      }}
    />
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={
      <SiteHeaderNavigation
        brand={<BrandLogo />}
        labels={{ templates: "Templates", categories: "Categories", howItWorks: "How it works" }}
      />
    }>
      <AuthenticatedSiteHeader />
    </Suspense>
  );
}

export async function SiteFooter() {
  const account = await getAuthenticatedProfile();
  const content = await getSiteContent(account?.supabase ?? await createClient(), "footer");
  const socialLinks = [
    ["instagram", "Instagram", content["footer.social_instagram"], "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"],
    ["tiktok", "TikTok", content["footer.social_tiktok"], "M12 2h3c.2 2 1.3 3.8 3.2 4.8 1.1.6 2.3.9 3.8 1v3.2a11 11 0 0 1-6-2v6.8a7 7 0 1 1-7-7h1v3.3h-1a3.7 3.7 0 1 0 3.7 3.7V2Z"],
    ["pinterest", "Pinterest", content["footer.social_pinterest"], "M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.8.2-2.7l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.8 0 1.2.6 1.2 1.4 0 .9-.6 2.2-.9 3.5-.3 1 .5 1.8 1.5 1.8 1.8 0 3.1-2.4 3.1-5.2 0-2.2-1.5-3.8-4.1-3.8-3 0-4.8 2.2-4.8 4.6 0 .8.2 1.6.7 2.1.2.2.2.4.1.7l-.2.8c-.1.3-.3.4-.6.3-1.3-.5-1.9-1.9-1.9-3.5 0-2.6 2.2-5.7 6.7-5.7 3.6 0 6 2.6 6 5.4 0 3.7-2 6.5-5 6.5-1 0-2-.6-2.3-1.2l-.7 2.8c-.2 1-.8 1.9-1.3 2.7A10 10 0 1 0 12 2Z"],
    ["linkedin", "LinkedIn", content["footer.social_linkedin"], "M5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3.3 9h3.4v12H3.3V9Zm5.5 0H12v1.6h.1A4 4 0 0 1 15.7 9c3.8 0 4.5 2.5 4.5 5.7V21h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H8.8V9Z"],
    ["youtube", "YouTube", content["footer.social_youtube"], "M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9A3 3 0 0 0 3.1 19c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.8 15.8V8.2l6.5 3.8-6.5 3.8Z"],
  ] as const;
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <BrandLogo />
          <p style={{ whiteSpace: "pre-line" }}>
            {content["footer.tagline"] || "A little more intention.\nA lot less starting from scratch."}
          </p>
        </div>
        <div className="footer-links">
          <span>{content["footer.collection_heading"] || "THE COLLECTION"}</span>
          <Link href="/templates">All templates</Link>
          <Link href="/categories">Browse categories</Link>
          <Link href="/templates">New &amp; noteworthy</Link>
        </div>
        <div className="footer-links">
          <span>{content["footer.information_heading"] || "GOOD TO KNOW"}</span>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">Our story</Link>
          <Link href="/contact">Get in touch</Link>
          <Link href="/faq">Frequently asked questions</Link>
          <Link href="/refund-policy">Refund policy</Link>
        </div>
        <div className="footer-newsletter">
          <span>{content["footer.newsletter_heading"] || "A NOTE FROM US"}</span>
          <p>{content["footer.newsletter_text"] || "Good things, occasionally. Never noise."}</p>
          <Link className="newsletter-link" href="/newsletter">
            Join the list <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FORM &amp; FIELD. MADE WITH INTENTION.</span>
        <div>
          {socialLinks.map(([key, label, value, path]) => {
            const socialUrl = getSafeSocialUrl(value);
            return socialUrl ? (
              <Link aria-label={label} className="footer-social-link" href={socialUrl} key={key} rel="noopener noreferrer" target="_blank">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d={path} /></svg>
              </Link>
            ) : null;
          })}
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/contact">Contact</Link>
          <span>✳ INDEPENDENT BY DESIGN</span>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>{children}</main>
      <Suspense fallback={<div className="site-footer-loading" aria-hidden="true" />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
