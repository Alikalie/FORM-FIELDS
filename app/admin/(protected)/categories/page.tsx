import Link from "next/link";
import { deleteCategoryAction } from "@/app/actions/admin";
import { ConfirmDeleteForm } from "@/app/admin/_components/confirm-delete-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [{ data: categories, error, count }, query] = await Promise.all([
    account.supabase
      .from("categories")
      .select("id, name, slug, description, is_active", { count: "planned" })
      .order("name")
      .limit(50),
    searchParams,
  ]);

  return (
    <main className="admin-content">
      <header className="admin-page-heading">
        <div><div className="admin-eyebrow">CATALOG MANAGEMENT</div><h1>Categories</h1><p>Organize marketplace listings and control storefront visibility.</p></div>
        <div className="admin-heading-actions">
          <Link className="button button-secondary" href="/admin/templates">Manage templates</Link>
          <Link className="button button-primary" href="/admin/categories/new"><span aria-hidden="true">＋</span> Add category</Link>
        </div>
      </header>
      {query.saved && <p className="admin-success" role="status">Category saved.</p>}
      {query.deleted && <p className="admin-success" role="status">Category deleted.</p>}
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load categories.</strong><p>{error.message}</p></section>
      ) : categories.length ? (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td><td>{category.slug}</td><td>{category.description || "—"}</td>
                    <td>{category.is_active ? "Active" : "Inactive"}</td>
                    <td className="admin-row-actions">
                      <Link className="admin-row-button" href={`/admin/categories/${category.id}/edit`}>Edit</Link>
                      <ConfirmDeleteForm action={deleteCategoryAction} id={category.id} label={category.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {count !== null && count > categories.length && <p className="admin-table-note">Showing {categories.length} of approximately {count} categories.</p>}
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No categories yet</h2><p>Create a category before adding templates.</p><Link className="button button-primary" href="/admin/categories/new">Add category</Link></section>
      )}
    </main>
  );
}
