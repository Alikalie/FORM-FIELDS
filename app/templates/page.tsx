import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { getPageContent } from "@/lib/site-content";
import { PageIntro, PageShell } from "../components/site-chrome";
import { TemplateBrowser, type BrowserCategory, type BrowserTemplate } from "./template-browser";

type TemplateSearchParams = {
  q?: string | string[];
  category?: string | string[];
  type?: string | string[];
  maxPrice?: string | string[];
  price_type?: string | string[];
  max_price?: string | string[];
  sort?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function TemplateCollection({ searchParams }: { searchParams: Promise<TemplateSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const account = await getAuthenticatedProfile();
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (categoryError) {
    return <p className="admin-error" role="alert">Could not load template categories: {categoryError.message}</p>;
  }

  const { data: priceData, error: priceError } = await supabase
    .from("templates")
    .select("price")
    .eq("is_published", true)
    .order("price", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (priceError) {
    return <p className="admin-error" role="alert">Could not load template price range: {priceError.message}</p>;
  }

  const maxAvailablePrice = Math.max(Number(priceData?.price ?? 0), 1);
  const categoryIds = (categories ?? []).map((category) => category.id);
  const categoryById = new Map((categories ?? []).map((category) => [category.id, category]));
  const search = (firstParam(resolvedSearchParams.q) ?? "").slice(0, 100).trim();
  const safeSearch = search.replace(/[^\p{L}\p{N}\s'-]/gu, " ").trim().replace(/\s+/g, " ");
  const requestedCategory = firstParam(resolvedSearchParams.category) ?? "all";
  const selectedCategory = (categories ?? []).find((category) => category.slug === requestedCategory);
  const category = selectedCategory?.slug ?? "all";
  const requestedPriceType = firstParam(resolvedSearchParams.type ?? resolvedSearchParams.price_type);
  const priceType = requestedPriceType === "free" || requestedPriceType === "paid"
    ? requestedPriceType
    : "all";
  const maxPriceParam = firstParam(resolvedSearchParams.maxPrice ?? resolvedSearchParams.max_price);
  const requestedMaxPrice = maxPriceParam === undefined ? maxAvailablePrice : Number(maxPriceParam);
  const maxPrice = Number.isFinite(requestedMaxPrice)
    ? Math.max(0, Math.min(maxAvailablePrice, requestedMaxPrice))
    : maxAvailablePrice;
  const requestedSort = firstParam(resolvedSearchParams.sort);
  const sortBy = requestedSort === "price-low" || requestedSort === "price-high"
    ? requestedSort
    : "newest";
  const returnParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => returnParams.append(key, item));
    } else if (value !== undefined) {
      returnParams.set(key, value);
    }
  }
  const returnTo = returnParams.size ? `/templates?${returnParams.toString()}` : "/templates";

  if (!categoryIds.length) {
    return <TemplateBrowser
      categories={[]}
      templates={[]}
      filters={{ search, category, priceType, maxPrice, sortBy }}
      favoriteIds={{}}
      returnTo={returnTo}
      canSaveFavorites={Boolean(account?.isActive)}
      maxAvailablePrice={maxAvailablePrice}
      resultCount={0}
    />;
  }

  const categorySearchIds = safeSearch
    ? await supabase
        .from("categories")
        .select("id")
        .eq("is_active", true)
        .ilike("name", `%${safeSearch}%`)
    : { data: [], error: null };
  if (categorySearchIds.error) {
    return <p className="admin-error" role="alert">Could not search categories: {categorySearchIds.error.message}</p>;
  }

  const matchingCategoryIds = (categorySearchIds.data ?? [])
    .map(({ id }) => id)
    .filter((id) => !selectedCategory || id === selectedCategory.id);
  let query = supabase
    .from("templates")
    .select("id, title, slug, short_description, price, currency, is_free, category_id, created_at", { count: "exact" })
    .eq("is_published", true)
    .in("category_id", selectedCategory ? [selectedCategory.id] : categoryIds);

  if (priceType === "free") query = query.eq("is_free", true);
  if (priceType === "paid") query = query.eq("is_free", false).gt("price", 0);
  if (maxPrice < maxAvailablePrice) query = query.lte("price", maxPrice);
  if (safeSearch) {
    const searchFilters = [
      `title.ilike.%${safeSearch}%`,
      `short_description.ilike.%${safeSearch}%`,
    ];
    if (matchingCategoryIds.length) {
      searchFilters.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    }
    query = query.or(searchFilters.join(","));
  }
  if (sortBy === "price-low") query = query.order("price", { ascending: true, nullsFirst: true });
  else if (sortBy === "price-high") query = query.order("price", { ascending: false, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });

  const { data: records, error: templatesError, count } = await query.limit(500);

  if (templatesError) {
    return <p className="admin-error" role="alert">Could not load templates: {templatesError.message}</p>;
  }

  const browserCategories: BrowserCategory[] = (categories ?? []).map(({ name, slug }) => ({ name, slug }));
  const browserTemplates: BrowserTemplate[] = (records ?? []).flatMap((record) => {
    const recordCategory = categoryById.get(record.category_id);
    if (!recordCategory) return [];
    return [{
      ...record,
      category_name: recordCategory.name,
      category_slug: recordCategory.slug,
    }];
  });

  const favoriteResult = account?.isActive && browserTemplates.length
    ? await supabase
        .from("favorites")
        .select("id, template_id")
        .eq("user_id", account.user.id)
        .in("template_id", browserTemplates.map((template) => template.id))
    : { data: [], error: null };
  if (favoriteResult.error) {
    return <p className="admin-error" role="alert">Could not load saved templates: {favoriteResult.error.message}</p>;
  }
  const favoriteIds = Object.fromEntries(
    (favoriteResult.data ?? []).map((favorite) => [favorite.template_id, favorite.id]),
  );

  return (
    <>
      {count !== null && count > browserTemplates.length && (
        <p className="admin-form-help" role="status">Showing the first {browserTemplates.length} of {count} matching templates.</p>
      )}
      <TemplateBrowser
        categories={browserCategories}
        templates={browserTemplates}
        filters={{ search, category, priceType, maxPrice, sortBy }}
        favoriteIds={favoriteIds}
        returnTo={returnTo}
        canSaveFavorites={Boolean(account?.isActive)}
        maxAvailablePrice={maxAvailablePrice}
        resultCount={count ?? browserTemplates.length}
      />
    </>
  );
}

async function TemplatesIntro() {
  const content = await getPageContent(await createClient(), "templates");
  return (
    <PageIntro
      eyebrow={content.eyebrow || "THE COLLECTION"}
      title={content.title || "Good ideas start somewhere."}
      description={content.description || "Find a thoughtful starting point for your next big idea. Search independent designs and make them your own."}
    />
  );
}

export default function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>;
}) {
  return (
    <PageShell>
      <section className="inner-section">
        <Suspense fallback={<div className="page-intro"><p role="status">Loading page content...</p></div>}>
          <TemplatesIntro />
        </Suspense>
        <Suspense fallback={<p role="status">Loading templates...</p>}>
          <TemplateCollection searchParams={searchParams} />
        </Suspense>
      </section>
    </PageShell>
  );
}
