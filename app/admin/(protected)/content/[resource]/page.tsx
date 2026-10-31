import { notFound } from "next/navigation";
import { SiteContentManager } from "@/app/admin/_components/site-content-manager";
import { Suspense } from "react";

const resourceDetails: Record<string, { title: string; description: string }> = {
  settings: { title: "Site settings", description: "Global marketplace settings and branding." },
  navigation: { title: "Navigation", description: "Header and footer links." },
  pages: { title: "Static pages", description: "About, FAQ, and policy page content." },
  footer: { title: "Footer", description: "Footer copy, links, and social destinations." },
};

export default async function AdminContentResourcePage({
  params,
  searchParams,
}: PageProps<"/admin/content/[resource]">) {
  const [{ resource }, query] = await Promise.all([params, searchParams]);
  const detail = resourceDetails[resource];
  if (!detail) notFound();

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">WEBSITE MANAGEMENT</div><h1>{detail.title}</h1><p>{detail.description}</p></div></header>
      {query.saved && <p className="admin-success" role="status">Website content saved.</p>}
      {query.deleted && <p className="admin-success" role="status">Website content deleted.</p>}
      <Suspense fallback={<p role="status">Loading content...</p>}>
        <SiteContentManager section={resource === "settings" ? "settings" : resource} />
      </Suspense>
    </main>
  );
}
