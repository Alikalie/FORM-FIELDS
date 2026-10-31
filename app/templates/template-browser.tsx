"use client";

import Link from "next/link";
import { useState } from "react";
import { removeFavoriteAction, saveFavoriteAction } from "@/app/actions/customer";
import { TemplateFilters } from "./template-filters";

export type BrowserTemplate = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price: number | null;
  currency: string | null;
  is_free: boolean | null;
  created_at: string;
  category_name: string;
  category_slug: string;
};

export type BrowserCategory = {
  name: string;
  slug: string;
};

const pageSize = 6;

function formatPrice(template: BrowserTemplate) {
  if (template.is_free || Number(template.price ?? 0) === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: template.currency || "USD",
  }).format(Number(template.price));
}

export function TemplateBrowser({
  categories,
  templates,
  filters,
  favoriteIds,
  returnTo,
  canSaveFavorites,
  maxAvailablePrice,
  resultCount,
}: {
  categories: BrowserCategory[];
  templates: BrowserTemplate[];
  favoriteIds: Record<string, string>;
  returnTo: string;
  canSaveFavorites: boolean;
  maxAvailablePrice: number;
  filters: {
    search: string;
    category: string;
    priceType: string;
    maxPrice: number;
    sortBy: string;
  };
  resultCount: number;
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [filtersOpen, setFiltersOpen] = useState(
    filters.category !== "all" ||
    filters.priceType !== "all" ||
    filters.maxPrice < maxAvailablePrice ||
    Boolean(filters.search),
  );
  const visibleTemplates = templates.slice(0, visibleCount);
  const filtersChanged = filters.category !== "all" ||
    filters.priceType !== "all" ||
    filters.maxPrice < maxAvailablePrice ||
    Boolean(filters.search) ||
    filters.sortBy !== "newest";

  return (
    <>
      <form action="/templates" className="template-filter-form" id="template-filter-form" method="get">
        <div className="marketplace-toolbar">
          <label className="marketplace-search">
            <span aria-hidden="true">⌕</span>
            <span className="visually-hidden">Search templates</span>
            <input
              defaultValue={filters.search}
              maxLength={100}
              name="q"
              placeholder="Search templates or categories"
              type="search"
            />
          </label>
          <label className="sort-control">
            <span>Sort by</span>
            <select defaultValue={filters.sortBy} name="sort">
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        <button
          aria-expanded={filtersOpen}
          className="filter-toggle"
          onClick={() => setFiltersOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true">☷</span>
          {filtersOpen ? "Hide filters" : "Filter templates"}
          <span className="filter-toggle-count">{resultCount} results</span>
        </button>
      </form>

      <div className={`marketplace-layout${filtersOpen ? " filters-open" : ""}`}>
        <TemplateFilters
          categories={categories}
          category={filters.category}
          formId="template-filter-form"
          key={`${filters.category}:${filters.priceType}:${filters.maxPrice}`}
          maxAvailablePrice={maxAvailablePrice}
          maxPrice={filters.maxPrice}
          type={filters.priceType}
        />

        <div className="marketplace-results">
            <div aria-live="polite" className="results-summary">
              <span><strong>{resultCount}</strong> templates</span>
              {filtersChanged && <Link href="/templates">Clear filters</Link>}
            </div>
            {visibleTemplates.length ? (
              <div className="catalog-grid">
                {visibleTemplates.map((template) => (
                <article className="template-card" key={template.id}>
                  <Link
                    aria-label={`Learn more about ${template.title}`}
                    className="template-cover preview-founder catalog-cover"
                    href={`/templates/${template.slug}`}
                  >
                    <div className="catalog-template-art">
                      <span>{template.category_name}</span>
                      <strong>{template.title}</strong>
                      <small>{template.is_free || Number(template.price ?? 0) === 0 ? "FREE TO DOWNLOAD" : "MADE TO MAKE YOUR OWN"}</small>
                    </div>
                    <span className="save-button" aria-hidden="true">↗</span>
                  </Link>
                  <div className="template-meta"><span>{template.category_name.toUpperCase()}</span></div>
                  <div className="template-title-row"><h2>{template.title}</h2><span>{formatPrice(template)}</span></div>
                  <p className="template-creator">{template.short_description || "A thoughtful template, ready to make your own."}</p>
                  <div className="template-card-actions">
                    <Link className="template-card-detail-link" href={`/templates/${template.slug}`}>View details</Link>
                    {canSaveFavorites ? (
                      favoriteIds[template.id] ? (
                        <form action={removeFavoriteAction}>
                          <input name="favorite_id" type="hidden" value={favoriteIds[template.id]} />
                          <input name="return_to" type="hidden" value={returnTo} />
                          <button aria-label={`Remove ${template.title} from favorites`} className="template-card-favorite saved" type="submit">
                            ♥ Saved
                          </button>
                        </form>
                      ) : (
                        <form action={saveFavoriteAction}>
                          <input name="template_id" type="hidden" value={template.id} />
                          <input name="return_to" type="hidden" value={returnTo} />
                          <button aria-label={`Save ${template.title} to favorites`} className="template-card-favorite" type="submit">
                            ♡ Save
                          </button>
                        </form>
                      )
                    ) : (
                      <Link
                        className="template-card-favorite"
                        href={`/login?next=${encodeURIComponent(returnTo)}`}
                      >
                        ♡ Save
                      </Link>
                    )}
                  </div>
                </article>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <span className="eyebrow">NO MATCHES JUST YET</span>
                <h2>Try a different starting point.</h2>
                <p>Adjust your search or clear the filters to see more templates.</p>
                <Link className="button button-primary" href="/templates">Clear filters</Link>
              </div>
            )}
            {visibleCount < templates.length && (
              <div className="load-more">
                <p>Showing {visibleTemplates.length} of {resultCount}</p>
                <button className="button load-more-button" onClick={() => setVisibleCount((count) => count + pageSize)} type="button">
                  Load more templates <span aria-hidden="true">↓</span>
                </button>
              </div>
            )}
          </div>
      </div>
    </>
  );
}
