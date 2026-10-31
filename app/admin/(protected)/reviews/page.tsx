import { deleteReviewAction, moderateReviewAction } from "@/app/actions/admin";
import { ConfirmDeleteForm } from "@/app/admin/_components/confirm-delete-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; deleted?: string }>;
}) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [{ data: reviews, error, count }, query] = await Promise.all([
    account.supabase
      .from("reviews")
      .select("id, user_id, template_id, rating, body, is_published, created_at, templates(title)", { count: "planned" })
      .order("created_at", { ascending: false })
      .limit(50),
    searchParams,
  ]);

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CUSTOMER FEEDBACK</div><h1>Reviews</h1><p>Moderate customer feedback before it appears publicly.</p></div><span className="admin-record-count">{count ?? "—"} reviews</span></header>
      {query.updated === "published" && <p className="admin-success" role="status">Review published.</p>}
      {query.updated === "unpublished" && <p className="admin-success" role="status">Review unpublished.</p>}
      {query.deleted && <p className="admin-success" role="status">Review deleted.</p>}
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load reviews.</strong><p>{error.message}</p><small>Apply the admin management migration if the reviews table is not present.</small></section>
      ) : reviews.length ? (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr><th>Template</th><th>Customer</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {reviews.map((review) => {
                  const linkedTemplate = Array.isArray(review.templates) ? review.templates[0] : review.templates;
                  return (
                    <tr key={review.id}>
                      <td>{linkedTemplate?.title || review.template_id}</td>
                      <td>{review.user_id}</td>
                      <td>{review.rating} / 5</td>
                      <td>{review.body}</td>
                      <td>{review.is_published ? "Published" : "Pending"}</td>
                      <td className="admin-row-actions">
                        <form action={moderateReviewAction}>
                          <input name="id" type="hidden" value={review.id} />
                          <input name="is_published" type="hidden" value={review.is_published ? "off" : "on"} />
                          <button className="admin-row-action-button" type="submit">{review.is_published ? "Unpublish" : "Publish"}</button>
                        </form>
                        <ConfirmDeleteForm action={deleteReviewAction} id={review.id} label="this review" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No reviews yet</h2><p>Customer reviews will appear here for moderation.</p></section>
      )}
    </main>
  );
}
