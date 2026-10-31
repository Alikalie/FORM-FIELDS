import Link from "next/link";
import { saveCategoryAction } from "@/app/actions/admin";

type CategoryValues = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

export function CategoryForm({ category }: { category?: CategoryValues }) {
  return (
    <form action={saveCategoryAction} className="admin-edit-form">
      {category && <input name="id" type="hidden" value={category.id} />}
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>
          <div><h2>Category details</h2><p>Give shoppers a clear name and a short explanation of what belongs here.</p></div>
        </div>
        <label>
          Category name <span className="admin-required">Required</span>
          <input autoComplete="off" defaultValue={category?.name ?? ""} maxLength={100} name="name" placeholder="e.g. CV & Resume" required />
        </label>
        <label>
          URL slug
          <input defaultValue={category?.slug ?? ""} maxLength={120} name="slug" placeholder="Leave blank to generate from the category name" />
          <small className="admin-field-help">Used in the category page URL. Use lowercase letters and hyphens.</small>
        </label>
        <label>
          Description
          <textarea defaultValue={category?.description ?? ""} maxLength={500} name="description" placeholder="Tell shoppers what kinds of templates they will find here." rows={4} />
        </label>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>
          <div><h2>Storefront appearance</h2><p>Add an optional image reference and choose whether shoppers can see this category.</p></div>
        </div>
        <label>
          Image URL
          <input defaultValue={category?.image_url ?? ""} name="image_url" placeholder="https://example.com/category-image.jpg" type="url" />
        </label>
        <label className="admin-toggle-field">
          <input defaultChecked={category?.is_active ?? true} name="is_active" type="checkbox" />
          <span><strong>Show category on the storefront</strong><small>Inactive categories are hidden from shoppers and category filters.</small></span>
        </label>
      </section>
      <div className="admin-form-actions">
        <button className="button button-primary" type="submit">
          <span aria-hidden="true">{category ? "✓" : "+"}</span>
          {category ? "Save category" : "Create category"}
        </button>
        <Link className="button button-secondary" href="/admin/categories">Cancel</Link>
      </div>
    </form>
  );
}
