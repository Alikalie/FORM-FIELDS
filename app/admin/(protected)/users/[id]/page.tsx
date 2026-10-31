import Link from "next/link";
import { notFound } from "next/navigation";
import { updateUserAccountAction } from "@/app/actions/admin";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const account = await getAuthenticatedProfile();
  if (!account) return null;
  const query = await searchParams;

  const { data: profile, error } = await account.supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load user profile: ${error.message}`);
  if (!profile) notFound();

  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin/users">← All users</Link>
      <header className="admin-page-heading"><div><div className="admin-eyebrow">ACCOUNT MANAGEMENT</div><h1>User profile</h1><p>Profile details are shown read-only.</p></div></header>
      {query.saved && <p className="admin-success" role="status">Account access updated.</p>}
      <section className="admin-table-card">
        <dl className="admin-profile-details">
          {Object.entries(profile).map(([key, value]) => (
            <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{value === null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>
          ))}
        </dl>
      </section>
      {account.role === "super_admin" && profile.id !== account.user.id ? (
        <section className="admin-form-card">
          <h2>Account access</h2>
          <form action={updateUserAccountAction} className="admin-edit-form">
            <input name="id" type="hidden" value={profile.id} />
            <label>
              Role
              <select defaultValue={profile.role || "user"} name="role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </label>
            <label className="admin-checkbox-field">
              <input defaultChecked={profile.is_active} name="is_active" type="checkbox" />
              Account active
            </label>
            <button className="button button-primary" type="submit">Save account access</button>
          </form>
        </section>
      ) : (
        <p className="admin-form-help">
          {profile.id === account.user.id
            ? "Your own role and active status cannot be changed here."
            : "Only a super admin can change account roles and active status."}
        </p>
      )}
      <p className="admin-form-help">This changes marketplace profile status. It does not ban the Supabase Auth identity at the provider level.</p>
    </main>
  );
}
