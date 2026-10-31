import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageIntro, PageShell } from "../components/site-chrome";
import { getPageContent } from "@/lib/site-content";

async function CategoryDirectory() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return <p className="admin-error" role="alert">Could not load categories: {error.message}</p>;
  }

  return categories.length ? (
    <div className="category-grid category-page-grid">
      {categories.map((category, index) => (
        <Link className="category-card" href={`/categories/${category.slug}`} key={category.id}>
          <div className={`category-icon category-icon-${String(index + 1).padStart(2, "0")}`}>
            <span>{category.name.charAt(0)}</span>
          </div>
          <div className="category-info">
            <span>{String(index + 1).padStart(2, "0")} / CATEGORY</span>
            <h2>{category.name}</h2>
            <p>{category.description || `Browse templates in ${category.name}.`}</p>
          </div>
          <span className="category-arrow" aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  ) : (
    <div className="empty-collection"><p>There are no active categories yet.</p></div>
  );
}

export default function CategoriesPage() {
  return (
    <PageShell>
      <Suspense fallback={<section className="inner-section"><p role="status">Loading categories...</p></section>}>
        <CategoriesContent />
      </Suspense>
    </PageShell>
  );
}

async function CategoriesContent() {
  const content = await getPageContent(await createClient(), "categories");
  return (
    <section className="inner-section">
      <PageIntro
        eyebrow={content.eyebrow || "FIND YOUR STARTING POINT"}
        title={content.title || "A category for what you’re creating."}
        description={content.description || "Choose the kind of work you’re doing and find a thoughtful place to begin."}
      />
      <CategoryDirectory />
    </section>
  );
}
