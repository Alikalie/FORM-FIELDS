import Link from "next/link";
import { deleteTemplateAction } from "@/app/actions/admin";
import { ConfirmDeleteForm } from "@/app/admin/_components/confirm-delete-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [{ data: templates, error, count }, query] = await Promise.all([
    account.supabase
      .from("templates")
      .select("id, title, slug, price, currency, is_free, is_published, is_featured, created_at", { count: "planned" })
      .order("created_at", { ascending: false })
      .limit(50),
    searchParams,
  ]);

  return (
    <main className="admin-content">
      <header className="admin-page-heading">
        <div><div className="admin-eyebrow">CATALOG MANAGEMENT</div><h1>Templates</h1><p>Create listings, update prices, and control publication status.</p></div>
        <div className="admin-heading-actions">
          <Link className="button button-secondary" href="/admin/categories">Manage categories</Link>
          <Link className="button button-primary" href="/admin/templates/new"><span aria-hidden="true">＋</span> Add template</Link>
        </div>
      </header>
      {query.saved && <p className="admin-success" role="status">Template saved.</p>}
      {query.deleted && <p className="admin-success" role="status">Template deleted.</p>}
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load templates.</strong><p>{error.message}</p></section>
      ) : templates.length ? (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr><th>Title</th><th>Slug</th><th>Price</th><th>Status</th><th>Featured</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.title}</td>
                    <td>{template.slug}</td>
                    <td>{template.is_free || Number(template.price ?? 0) === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: template.currency || "USD" }).format(Number(template.price))}</td>
                    <td>{template.is_published ? "Published" : "Draft"}</td>
                    <td>{template.is_featured ? "Yes" : "No"}</td>
                    <td>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(template.created_at))}</td>
                    <td className="admin-row-actions">
                      <Link className="admin-row-button" href={`/admin/templates/${template.id}/edit`}>Edit</Link>
                      <ConfirmDeleteForm action={deleteTemplateAction} id={template.id} label={template.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {count !== null && count > templates.length && <p className="admin-table-note">Showing {templates.length} of approximately {count} templates.</p>}
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No templates yet</h2><p>Create your first listing to add it to the catalog.</p><Link className="button button-primary" href="/admin/templates/new">Add template</Link></section>
      )}
    </main>
  );
}
