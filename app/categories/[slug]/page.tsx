import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageIntro, PageShell } from "../../components/site-chrome";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

async function CategoryCollection({ slug }: { slug: string }) {
  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    return (
      <section className="inner-section">
        <div className="rounded-xl bg-red-50 p-6 text-red-700">
          Failed to load category: {categoryError.message}
        </div>
      </section>
    );
  }

  if (!category) notFound();

  const { data: templates, error: templatesError } = await supabase
    .from("templates")
    .select("id, title, slug, short_description, price, currency, is_free")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("title");

  return (
    <section className="inner-section">
      <Link className="back-link" href="/categories">← All categories</Link>
      <PageIntro
        eyebrow="BROWSE CATEGORY"
        title={`${category.name}, made simpler.`}
        description={category.description || `Browse templates in ${category.name}.`}
      />

      {templatesError ? (
        <div className="mt-10 rounded-xl bg-red-50 p-6 text-red-700">
          Failed to load templates: {templatesError.message}
        </div>
      ) : templates.length > 0 ? (
        <div className="catalog-grid">
          {templates.map((template) => (
            <article className="template-card" key={template.id}>
              <Link
                className="template-cover preview-founder catalog-cover"
                href={`/templates/${template.slug}`}
                aria-label={`View ${template.title}`}
              >
                <div className="catalog-template-art">
                  <span>{category.name}</span>
                  <strong>{template.title}</strong>
                  <small>MADE TO MAKE YOUR OWN</small>
                </div>
                <span className="save-button" aria-hidden="true">↗</span>
              </Link>
              <div className="template-meta">
                <span>{category.name.toUpperCase()}</span>
              </div>
              <div className="template-title-row">
                <h2>{template.title}</h2>
                <span>
                  {template.is_free || template.price === 0
                    ? "Free"
                    : new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: template.currency || "USD",
                      }).format(template.price)}
                </span>
              </div>
              {template.short_description && (
                <p className="template-creator">{template.short_description}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-collection">
          <span className="eyebrow">WE&apos;RE GROWING THIS COLLECTION</span>
          <p>
            There aren&apos;t any {category.name.toLowerCase()} templates available yet.
            In the meantime, explore the full collection.
          </p>
          <Link className="button button-primary" href="/templates">
            Browse all templates <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}

function CategoryLoading() {
  return (
    <section className="inner-section">
      <p role="status">Loading category...</p>
    </section>
  );
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<CategoryLoading />}>
        {params.then(({ slug }) => <CategoryCollection slug={slug} />)}
      </Suspense>
    </PageShell>
  );
}
