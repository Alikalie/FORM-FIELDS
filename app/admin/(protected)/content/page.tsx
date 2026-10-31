import Link from "next/link";
import { Suspense } from "react";
import { SiteContentManager } from "@/app/admin/_components/site-content-manager";

const resources = [
  ["Site settings", "Marketplace name and global settings", "settings"],
  ["Navigation", "Header and footer navigation links", "navigation"],
  ["Pages", "Static page content", "pages"],
  ["Footer", "Footer links and text", "footer"],
] as const;

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const query = await searchParams;

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">WEBSITE MANAGEMENT</div><h1>Website content</h1><p>Manage text records used for settings, navigation, homepage, pages, and footer.</p></div></header>
      {query.saved && <p className="admin-success" role="status">Website content saved.</p>}
      {query.deleted && <p className="admin-success" role="status">Website content deleted.</p>}
      <div className="admin-module-grid">
        {resources.map(([title, detail, resource]) => (
          <Link className="admin-module-card admin-module-slate" href={`/admin/content/${resource}`} key={resource}>
            <span className="admin-module-icon" aria-hidden="true">▧</span>
            <h3>{title}</h3>
            <p>{detail}</p>
            <span className="admin-module-link">View requirements <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
      <Suspense fallback={<p role="status">Loading site content...</p>}><SiteContentManager /></Suspense>
    </main>
  );
}
