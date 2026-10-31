import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateForm } from "@/app/admin/_components/template-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { isMissingTemplateAssetColumns } from "@/lib/supabase/template-assets";

async function EditTemplateContent({ id }: { id: string }) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [templateResult, categoryResult] = await Promise.all([
    account.supabase
      .from("templates")
      .select("id, title, slug, short_description, price, currency, is_published, is_featured, category_id")
      .eq("id", id)
      .maybeSingle(),
    account.supabase.from("categories").select("id, name").order("name"),
  ]);

  if (templateResult.error) throw new Error(`Could not load template: ${templateResult.error.message}`);
  if (categoryResult.error) throw new Error(`Could not load categories: ${categoryResult.error.message}`);
  if (!templateResult.data) notFound();

  const { data: assets, error: assetsError } = await account.supabase
    .from("templates")
    .select("file_path, preview_image_path")
    .eq("id", id)
    .maybeSingle();
  if (assetsError && !isMissingTemplateAssetColumns(assetsError)) {
    throw new Error(`Could not load template files: ${assetsError.message}`);
  }

  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin/templates">← All templates</Link>
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CATALOG MANAGEMENT / EDIT TEMPLATE</div><h1>Edit template</h1><p>Update listing details, customer files, pricing, and storefront visibility.</p></div></header>
      <section className="admin-form-card">
        <div className="admin-form-card-intro"><span aria-hidden="true">▤</span><div><h2>{templateResult.data.title}</h2><p>Review each section and save your changes when ready.</p></div></div>
        <TemplateForm
          categories={categoryResult.data ?? []}
          template={{
            ...templateResult.data,
            file_path: assets?.file_path ?? null,
            preview_image_path: assets?.preview_image_path ?? null,
          }}
        />
      </section>
    </main>
  );
}

export default function EditTemplatePage({ params }: PageProps<"/admin/templates/[id]/edit">) {
  return <EditTemplateParams params={params} />;
}

async function EditTemplateParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditTemplateContent id={id} />;
}
