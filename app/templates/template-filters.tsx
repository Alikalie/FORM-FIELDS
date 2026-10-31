"use client";

import Link from "next/link";
import { useState } from "react";

type TemplateFilterCategory = {
  name: string;
  slug: string;
};

export function TemplateFilters({
  categories,
  category,
  type,
  maxPrice: initialMaxPrice,
  maxAvailablePrice,
  formId,
}: {
  categories: TemplateFilterCategory[];
  category: string;
  type: string;
  maxPrice: number;
  maxAvailablePrice: number;
  formId: string;
}) {
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  return (
    <aside aria-label="Filter templates" className="marketplace-filters">
      <div className="filter-heading">
        <h2>Filters</h2>
        <Link href="/templates">Clear all</Link>
      </div>
      <label className="filter-field">
        <span>Category</span>
        <select defaultValue={category} form={formId} name="category">
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
      </label>
      <fieldset className="filter-field filter-options">
        <legend>Price type</legend>
        {[
          ["all", "All templates"],
          ["free", "Free"],
          ["paid", "Paid"],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              defaultChecked={type === value}
              form={formId}
              name="type"
              type="radio"
              value={value}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <label className="filter-field price-slider">
        <span>Maximum price <b>{maxPrice >= maxAvailablePrice ? "Any" : `$${maxPrice.toFixed(0)}`}</b></span>
        <input
          max={maxAvailablePrice}
          form={formId}
          min="0"
          name={maxPrice < maxAvailablePrice ? "maxPrice" : undefined}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          step="1"
          type="range"
          value={maxPrice}
        />
        <span className="price-range-labels"><span>Free</span><span>${maxAvailablePrice.toFixed(0)}+</span></span>
      </label>
      <button className="button button-primary template-filter-submit" form={formId} type="submit">
        Apply filters
      </button>
    </aside>
  );
}
