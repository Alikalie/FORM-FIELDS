import Link from "next/link";
import { saveTemplateAction } from "@/app/actions/admin";
import { TemplateAssetFields } from "./template-asset-fields";

type CategoryOption = {
  id: string;
  name: string;
};

type TemplateValues = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price: number;
  currency: string | null;
  is_published: boolean;
  is_featured: boolean;
  category_id: string;
  file_path: string | null;
  preview_image_path: string | null;
};

export function TemplateForm({
  categories,
  template,
}: {
  categories: CategoryOption[];
  template?: TemplateValues;
}) {
  return (
    <form action={saveTemplateAction} className="admin-edit-form">
      {template && <input name="id" type="hidden" value={template.id} />}
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>01</span>
          <div><h2>Listing details</h2><p>Add the information customers use to discover and understand this template.</p></div>
        </div>
        <label>
          Template name <span className="admin-required">Required</span>
          <input autoComplete="off" defaultValue={template?.title ?? ""} maxLength={160} name="title" placeholder="e.g. Modern Professional CV" required />
        </label>
        <label>
          URL slug
          <input defaultValue={template?.slug ?? ""} maxLength={160} name="slug" placeholder="Leave blank to generate from the template name" />
          <small className="admin-field-help">Used in the public template URL. Use lowercase letters and hyphens.</small>
        </label>
        <label>
          Short description
          <textarea defaultValue={template?.short_description ?? ""} maxLength={500} name="short_description" placeholder="A concise summary shown on the storefront." rows={4} />
        </label>
      </section>
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>02</span>
          <div><h2>Price & category</h2><p>Choose the customer price and where this listing appears in the catalog.</p></div>
        </div>
        <div className="admin-form-row">
          <label>
            Price <span className="admin-required">Required</span>
            <input defaultValue={template?.price ?? 0} min="0" name="price" required step="0.01" type="number" />
            <small className="admin-field-help">Enter 0 to list this template as free.</small>
          </label>
          <label>
            Currency
            <input defaultValue={template?.currency ?? "USD"} maxLength={3} minLength={3} name="currency" required />
            <small className="admin-field-help">Use a 3-letter currency code, such as USD.</small>
          </label>
        </div>
        <label>
          Category <span className="admin-required">Required</span>
          <select defaultValue={template?.category_id ?? ""} name="category_id" required>
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        {categories.length === 0 && (
          <div className="admin-inline-notice" role="alert">
            <span>!</span>
            <p>Create a category first, then return here to finish this template.</p>
            <Link className="button button-secondary" href="/admin/categories/new">Add category</Link>
          </div>
        )}
      </section>
      <section className="admin-form-section">
        <div className="admin-form-section-heading">
          <span>03</span>
          <div><h2>Files & visibility</h2><p>Attach customer files and choose how the template is shown.</p></div>
        </div>
        <TemplateAssetFields filePath={template?.file_path} previewPath={template?.preview_image_path} />
        <div className="admin-visibility-options">
          <label className="admin-toggle-field">
            <input defaultChecked={template?.is_published ?? false} name="is_published" type="checkbox" />
            <span><strong>Publish this template</strong><small>Published templates are visible in the storefront.</small></span>
          </label>
          <label className="admin-toggle-field">
            <input defaultChecked={template?.is_featured ?? false} name="is_featured" type="checkbox" />
            <span><strong>Feature on the homepage</strong><small>Featured templates are prioritized in the homepage collection.</small></span>
          </label>
        </div>
      </section>
      <div className="admin-form-actions">
        <button className="button button-primary" disabled={categories.length === 0} type="submit">
          <span aria-hidden="true">{template ? "✓" : "+"}</span>
          {template ? "Save template" : "Create template"}
        </button>
        <Link className="button button-secondary" href="/admin/templates">Cancel</Link>
      </div>
    </form>
  );
}
