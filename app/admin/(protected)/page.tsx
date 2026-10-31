import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

const modules = [
  { title: "Templates", detail: "Review listings and publication status.", href: "/admin/templates", color: "blue" },
  { title: "Categories", detail: "Manage the marketplace categories.", href: "/admin/categories", color: "violet" },
  { title: "Users", detail: "Review customer accounts and roles.", href: "/admin/users", color: "green" },
  { title: "Purchases", detail: "Review order history and status.", href: "/admin/purchases", color: "orange" },
  { title: "Downloads", detail: "Monitor customer download records.", href: "/admin/downloads", color: "cyan" },
  { title: "Favorites & activity", detail: "Review saved-template activity.", href: "/admin/activity", color: "pink" },
  { title: "Reviews", detail: "Moderate customer feedback when reviews are configured.", href: "/admin/reviews", color: "violet" },
  { title: "Messages", detail: "Review messages submitted for support.", href: "/admin/messages", color: "pink" },
  { title: "Site Content", detail: "Manage shared content when CMS storage is configured.", href: "/admin/content", color: "slate" },
];

export default async function AdminPage() {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [
    templates,
    publishedTemplates,
    categories,
    activeCategories,
    users,
    purchases,
    downloads,
    messages,
  ] = await Promise.all([
    account.supabase.from("templates").select("id", { count: "planned", head: true }),
    account.supabase.from("templates").select("id", { count: "planned", head: true }).eq("is_published", true),
    account.supabase.from("categories").select("id", { count: "planned", head: true }),
    account.supabase.from("categories").select("id", { count: "planned", head: true }).eq("is_active", true),
    account.supabase.from("profiles").select("id", { count: "planned", head: true }),
    account.supabase.from("purchases").select("id", { count: "planned", head: true }),
    account.supabase.from("downloads").select("id", { count: "planned", head: true }),
    account.supabase.from("contact_messages").select("id", { count: "planned", head: true }),
  ]);

  const metrics = [
    { title: "Total templates", value: templates.count === null ? null : `~${templates.count}`, detail: `~${publishedTemplates.count ?? "—"} published`, result: templates },
    { title: "Categories", value: categories.count === null ? null : `~${categories.count}`, detail: `~${activeCategories.count ?? "—"} active`, result: categories },
    { title: "Customer accounts", value: users.count, detail: "Profiles in the database", result: users },
    { title: "Purchases", value: purchases.count, detail: "Recorded orders", result: purchases },
    { title: "Downloads", value: downloads.count, detail: "Recorded download events", result: downloads },
    { title: "Messages", value: messages.count, detail: "Contact messages", result: messages },
  ];

  const errors = [
    templates.error && `Templates: ${templates.error.message}`,
    publishedTemplates.error && `Published templates: ${publishedTemplates.error.message}`,
    categories.error && `Categories: ${categories.error.message}`,
    activeCategories.error && `Active categories: ${activeCategories.error.message}`,
    users.error && `Profiles: ${users.error.message}`,
    purchases.error && `Purchases: ${purchases.error.message}`,
    downloads.error && `Downloads: ${downloads.error.message}`,
    messages.error && `Contact messages: ${messages.error.message}`,
  ].filter((error): error is string => Boolean(error));

  return (
    <main className="admin-content">
      <header className="admin-page-heading">
        <div>
          <div className="admin-eyebrow">MARKETPLACE OVERVIEW</div>
          <h1>Admin dashboard</h1>
          <p>Welcome, {account.fullName}. Here&apos;s the current state of your marketplace.</p>
        </div>
        <span className="admin-role-badge">{account.role.replace("_", " ")}</span>
      </header>

      <section aria-label="Catalog shortcuts" className="admin-quick-actions">
        <div>
          <span className="admin-eyebrow">QUICK ACTIONS</span>
          <h2>Build your catalog</h2>
          <p>Start by organizing your store, then add templates for shoppers.</p>
        </div>
        <div className="admin-quick-action-buttons">
          <Link className="button button-secondary" href="/admin/categories/new">
            <span aria-hidden="true">▦</span> Add category
          </Link>
          <Link className="button button-primary" href="/admin/templates/new">
            <span aria-hidden="true">＋</span> Add template
          </Link>
        </div>
      </section>

      {errors.length > 0 && (
        <section className="admin-error" role="alert">
          <strong>Some admin data could not be loaded.</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </section>
      )}

      <section aria-label="Marketplace metrics" className="admin-metrics">
        {metrics.map((metric, index) => (
          <article className={`admin-metric admin-metric-${index + 1}`} key={metric.title}>
            <span>{metric.title}</span>
            <strong>{metric.result.error ? "—" : metric.value ?? 0}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>

      <section className="admin-module-section">
        <div className="admin-section-heading">
          <div><div className="admin-eyebrow">MANAGE YOUR STORE</div><h2>Admin workspace</h2></div>
          <p>Select a section to review its current records.</p>
        </div>
        <div className="admin-module-grid">
          {modules.map((module) => (
            <Link className={`admin-module-card admin-module-${module.color}`} href={module.href} key={module.title}>
              <span className="admin-module-icon" aria-hidden="true">↗</span>
              <h3>{module.title}</h3>
              <p>{module.detail}</p>
              <span className="admin-module-link">Open section <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
