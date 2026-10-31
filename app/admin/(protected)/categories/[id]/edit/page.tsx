import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/app/admin/_components/category-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

async function EditCategoryContent({ id }: { id: string }) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const { data: category, error } = await account.supabase
    .from("categories")
    .select("id, name, slug, description, image_url, is_active")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load category: ${error.message}`);
  if (!category) notFound();

  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin/categories">← All categories</Link>
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CATALOG MANAGEMENT / EDIT CATEGORY</div><h1>Edit category</h1><p>Update category details and storefront visibility.</p></div></header>
      <section className="admin-form-card">
        <div className="admin-form-card-intro"><span aria-hidden="true">▦</span><div><h2>{category.name}</h2><p>Update the collection details below.</p></div></div>
        <CategoryForm category={category} />
      </section>
    </main>
  );
}

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;
  return <EditCategoryContent id={id} />;
}
