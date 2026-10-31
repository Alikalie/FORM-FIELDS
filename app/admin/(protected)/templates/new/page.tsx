import Link from "next/link";
import { TemplateForm } from "@/app/admin/_components/template-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function NewTemplatePage() {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const { data: categories, error } = await account.supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin/templates">← All templates</Link>
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CATALOG MANAGEMENT / NEW TEMPLATE</div><h1>Add a template</h1><p>Create a complete listing with pricing, category, downloadable files, and storefront visibility.</p></div></header>
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load categories.</strong><p>{error.message}</p><Link className="button button-secondary" href="/admin/categories">Manage categories</Link></section>
      ) : (
        <section className="admin-form-card">
          <div className="admin-form-card-intro"><span aria-hidden="true">▤</span><div><h2>Template setup</h2><p>Fill in the listing details, then save it as a draft or publish it to the storefront.</p></div></div>
          <TemplateForm categories={categories ?? []} />
        </section>
      )}
    </main>
  );
}
