import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function AdminUsersPage() {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const { data: users, error, count } = await account.supabase
    .from("profiles")
    .select("*", { count: "planned" })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">ACCOUNT MANAGEMENT</div><h1>Users</h1><p>Review customer profiles and their current marketplace roles.</p></div><span className="admin-record-count">{count ?? "—"} profiles</span></header>
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load users.</strong><p>{error.message}</p></section>
      ) : users.length ? (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr><th>Profile ID</th><th>Name</th><th>Role</th><th>Created</th><th>Details</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.full_name || "—"}</td>
                    <td>{user.role || "user"}</td>
                    <td>{user.created_at ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(user.created_at)) : "—"}</td>
                    <td><Link href={`/admin/users/${user.id}`}>View profile</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {count !== null && count > users.length && <p className="admin-table-note">Showing {users.length} of approximately {count} profiles.</p>}
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No profiles found</h2><p>New customer profiles will appear here.</p></section>
      )}
      <p className="admin-form-help">Email addresses and account activation are managed by Supabase Auth. Role changes require a privileged server-side Auth integration and are intentionally not exposed here.</p>
    </main>
  );
}
