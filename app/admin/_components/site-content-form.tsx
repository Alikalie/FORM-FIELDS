import { deleteSiteContentAction, saveSiteContentAction } from "@/app/actions/admin";
import { ConfirmDeleteForm } from "./confirm-delete-form";

type SiteContentRecord = {
  id: string;
  content_key: string;
  section: string;
  content: string;
  updated_at: string;
};

export function SiteContentForm({
  content,
}: {
  content?: SiteContentRecord;
}) {
  return (
    <div className="admin-content-record">
      <form action={saveSiteContentAction} className="admin-edit-form">
        {content && <input name="id" type="hidden" value={content.id} />}
        <label>
          Content key
          <input defaultValue={content?.content_key ?? ""} name="content_key" placeholder="homepage.hero_title" required />
        </label>
        <label>
          Section
          <select defaultValue={content?.section ?? "homepage"} name="section">
            <option value="settings">Site settings</option>
            <option value="navigation">Navigation</option>
            <option value="homepage">Homepage</option>
            <option value="pages">Static pages</option>
            <option value="footer">Footer</option>
          </select>
        </label>
        <label>
          Text content
          <textarea defaultValue={content?.content ?? ""} name="content" rows={content?.content.includes("\n") ? 6 : 3} />
        </label>
        <button className="button button-primary" type="submit">{content ? "Save content" : "Add content"}</button>
      </form>
      {content && <ConfirmDeleteForm action={deleteSiteContentAction} id={content.id} label={content.content_key} />}
    </div>
  );
}
