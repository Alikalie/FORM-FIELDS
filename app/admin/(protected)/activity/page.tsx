import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function AdminActivityPage() {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const { data: favorites, error, count } = await account.supabase
    .from("favorites")
    .select("*, templates(title, slug)", { count: "planned" })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">MARKETPLACE ACTIVITY</div><h1>Favorites &amp; activity</h1><p>Review customer template saves recorded in favorites.</p></div><span className="admin-record-count">{count ?? "—"} records</span></header>
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load favorites.</strong><p>{error.message}</p></section>
      ) : favorites.length ? (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr><th>Customer ID</th><th>Template</th><th>Saved</th></tr></thead>
              <tbody>
                {favorites.map((favorite) => {
                  const linkedTemplate = Array.isArray(favorite.templates) ? favorite.templates[0] : favorite.templates;
                  return (
                    <tr key={favorite.id}>
                      <td>{favorite.user_id}</td>
                      <td>{linkedTemplate?.title || favorite.template_id}</td>
                      <td>{favorite.created_at ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(favorite.created_at)) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No favorites activity</h2><p>Customer favorites will appear here when available.</p></section>
      )}
    </main>
  );
}
