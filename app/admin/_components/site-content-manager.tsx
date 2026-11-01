import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { saveSiteContentAction } from "@/app/actions/admin";
import { SiteContentForm } from "./site-content-form";

export async function SiteContentManager({ section }: { section?: string } = {}) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  let query = account.supabase
    .from("site_content")
    .select("id, content_key, section, content, updated_at")
    .order("section")
    .order("content_key")
    .limit(100);
  if (section) query = query.eq("section", section);
  const { data: records, error } = await query;

  if (error) {
    return     <section className="admin-error" role="alert"><strong>Could not load site content.</strong><p>{error.message}</p><small>Verify the existing site_content columns and administrator read policy.</small></section>;
  }

  const footerSocials = [
    ["instagram", "Instagram"],
    ["tiktok", "TikTok"],
    ["pinterest", "Pinterest"],
    ["linkedin", "LinkedIn"],
    ["youtube", "YouTube"],
  ] as const;
  const footerValues = new Map(
    (records ?? [])
      .filter((record) => record.section === "footer")
      .map((record) => [record.content_key, record.content]),
  );

  return (
    <>
      <p className="admin-form-help">
        Storefront keys include <code>homepage.hero_title_prefix</code>, <code>homepage.hero_title_emphasis</code>,
        <code>homepage.hero_description</code>, <code>navigation.templates</code>, <code>navigation.categories</code>,
        <code>homepage.featured_heading</code>, <code>homepage.categories_heading</code>,
        and <code>footer.tagline</code>. Page keys use <code>about.title</code>, <code>faq.description</code>,
        <code>terms.body</code>, and similar names in the Pages section. Set <code>faq.items</code> as one
        <code> topic | question | answer</code> per line. Footer social links use the keys
        <code>footer.social_instagram</code>, <code>footer.social_tiktok</code>,
        <code>footer.social_pinterest</code>, <code>footer.social_linkedin</code>, or
        <code>footer.social_youtube</code> and require an HTTPS URL. Page sections supported by the storefront include
        homepage, about, faq, terms, privacy, cookies, refund-policy, how-it-works, contact, categories, and templates.
        Most page sections use <code>page.eyebrow</code>, <code>page.title</code>, and
        <code>page.description</code>; longer content uses <code>page.body</code> or page-specific items.
      </p>
      {(!section || section === "footer") && (
        <section className="admin-form-card footer-social-editor">
          <h2>Footer social links</h2>
          <p>Save an HTTPS profile URL to show its icon on the public footer. Leave it empty to hide that icon.</p>
          <div className="footer-social-fields">
            {footerSocials.map(([key, label]) => {
              const contentKey = `footer.social_${key}`;
              return (
                <form action={saveSiteContentAction} className="footer-social-field" key={key}>
                  <input name="content_key" type="hidden" value={contentKey} />
                  <input name="section" type="hidden" value="footer" />
                  <label>
                    {label} profile URL
                    <input
                      defaultValue={footerValues.get(contentKey) ?? ""}
                      name="content"
                      placeholder={`https://${key}.com/your-profile`}
                      type="url"
                    />
                  </label>
                  <button className="button button-primary" type="submit">Save</button>
                </form>
              );
            })}
          </div>
        </section>
      )}
      <section className="admin-form-card">
        <h2>Add content item</h2>
        <SiteContentForm />
      </section>
      {records.length ? (
        <section className="admin-content-records">
          {records.map((record) => (
            <article className="admin-form-card" key={record.id}>
              <div className="admin-content-record-heading">
                <div><span className="admin-eyebrow">{record.section}</span><h2>{record.content_key}</h2></div>
                <small>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(record.updated_at))}</small>
              </div>
              <SiteContentForm content={record} />
            </article>
          ))}
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No content items yet</h2><p>Add a key and content to start managing website content.</p></section>
      )}
    </>
  );
}
