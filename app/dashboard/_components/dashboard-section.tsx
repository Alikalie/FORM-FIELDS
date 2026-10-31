import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { removeFavoriteAction } from "@/app/actions/customer";

type DashboardSection = "downloads" | "purchases" | "favorites" | "profile";
type TemplateRecord = { title: string; slug: string } | { title: string; slug: string }[] | null;

function templateRecord(template: TemplateRecord) {
  return Array.isArray(template) ? template[0] : template;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="dashboard-section-header">
      <Link className="dashboard-back-link" href="/dashboard">← Dashboard overview</Link>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export async function DashboardSection({ section }: { section: DashboardSection }) {
  const account = await getAuthenticatedProfile();
  if (!account) redirect("/login");

  if (section === "profile") {
    return (
      <main className="dashboard-content dashboard-section-content">
        <SectionHeader
          title="My Profile"
          description="Review your account information and security settings."
        />
        <section className="dashboard-detail-card">
          <h2>Account information</h2>
          <dl className="dashboard-profile-details">
            <div><dt>Full name</dt><dd>{account.fullName}</dd></div>
            <div><dt>Email address</dt><dd>{account.user.email}</dd></div>
            <div><dt>Account status</dt><dd><span className="dashboard-account-status">{account.user.email_confirmed_at ? "Active" : "Email not verified"}</span></dd></div>
            <div><dt>Member since</dt><dd>{formatDate(account.createdAt)}</dd></div>
          </dl>
        </section>
        <section className="dashboard-detail-card dashboard-security-card">
          <div>
            <h2>Password &amp; security</h2>
            <p>Keep your account secure by updating your password when needed.</p>
          </div>
          <Link className="dashboard-primary-button" href="/forgot-password">Change password</Link>
        </section>
      </main>
    );
  }

  if (section === "downloads") {
    const [downloads, used, remaining] = await Promise.all([
      account.supabase
        .from("downloads")
        .select("id, template_id, downloaded_at, templates(title, slug)")
        .eq("user_id", account.user.id)
        .order("downloaded_at", { ascending: false })
        .limit(50),
      account.supabase.rpc("get_free_downloads_used"),
      account.supabase.rpc("get_free_downloads_remaining"),
    ]);

    return (
      <main className="dashboard-content dashboard-section-content">
        <SectionHeader
          title="My Downloads"
          description="Your download history and remaining free downloads."
        />
        <div className="dashboard-section-stat-row">
          <article><span>Free downloads used</span><strong>{used.error ? "—" : used.data ?? "—"} <small>of 3</small></strong></article>
          <article><span>Free downloads remaining</span><strong>{remaining.error ? "—" : remaining.data ?? "—"}</strong></article>
          <Link className="dashboard-primary-button" href="/templates">Browse templates</Link>
        </div>
        {(downloads.error || used.error || remaining.error) && (
          <p className="dashboard-section-error" role="alert">
            Could not load all download information: {[downloads.error?.message, used.error?.message, remaining.error?.message].filter(Boolean).join("; ")}
          </p>
        )}
        {downloads.error ? null : downloads.data.length ? (
          <section className="dashboard-detail-card">
            <h2>Download history</h2>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead><tr><th>Template</th><th>Downloaded</th><th>Action</th></tr></thead>
                <tbody>
                  {downloads.data.map((item) => {
                    const template = templateRecord(item.templates as TemplateRecord);
                    return (
                      <tr key={item.id}>
                        <td>{template?.title ?? "Template"}</td>
                        <td>{formatDate(item.downloaded_at)}</td>
                        <td className="dashboard-row-actions">
                          {template?.slug && <Link href={`/templates/${template.slug}`}>View template</Link>}
                          {template?.slug && <Link href={`/downloads/templates/${item.template_id}`}>Download again</Link>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {downloads.data.length === 50 && (
              <p className="dashboard-list-note">Showing your 50 most recent downloads.</p>
            )}
          </section>
        ) : <p className="dashboard-empty">You haven&apos;t downloaded any templates yet.</p>}
      </main>
    );
  }

  if (section === "purchases") {
    const { data: purchases, error } = await account.supabase
      .from("purchases")
      .select("id, template_id, amount, currency, status, purchased_at, created_at, templates(title, slug)")
      .eq("user_id", account.user.id)
      .order("purchased_at", { ascending: false })
      .limit(50);

    return (
      <main className="dashboard-content dashboard-section-content">
        <SectionHeader
          title="My Purchases"
          description="A clear record of the templates you have purchased."
        />
        {error ? (
          <p className="dashboard-section-error" role="alert">Could not load purchases: {error.message}</p>
        ) : purchases.length ? (
          <section className="dashboard-detail-card">
            <h2>Purchase history</h2>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead><tr><th>Template</th><th>Amount</th><th>Status</th><th>Purchase date</th><th>Download</th></tr></thead>
                <tbody>
                  {purchases.map((purchase) => {
                    const template = templateRecord(purchase.templates as TemplateRecord);
                    return (
                      <tr key={purchase.id}>
                        <td>{template?.title ?? "Template"}</td>
                        <td>{new Intl.NumberFormat("en", { style: "currency", currency: purchase.currency }).format(purchase.amount)}</td>
                        <td><span className="dashboard-account-status">{purchase.status}</span></td>
                        <td>{formatDate(purchase.purchased_at || purchase.created_at)}</td>
                        <td>
                          {purchase.status === "paid" && template?.slug
                            ? <Link href={`/downloads/templates/${purchase.template_id}`}>Download</Link>
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {purchases.length === 50 && (
              <p className="dashboard-list-note">Showing your 50 most recent purchases.</p>
            )}
          </section>
        ) : (
          <section className="dashboard-empty-state">
            <h2>No purchases yet</h2>
            <p>Templates you purchase will be listed here for easy reference.</p>
            <Link className="dashboard-primary-button" href="/templates">Explore templates</Link>
          </section>
        )}
      </main>
    );
  }

  const { data: favorites, error } = await account.supabase
    .from("favorites")
    .select("id, created_at, templates(title, slug)")
    .eq("user_id", account.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="dashboard-content dashboard-section-content">
      <SectionHeader
        title="My Favorites"
        description="The templates you have saved to come back to."
      />
      {error ? (
        <p className="dashboard-section-error" role="alert">Could not load favorites: {error.message}</p>
      ) : favorites.length ? (
        <section className="dashboard-detail-card">
          <h2>Saved templates</h2>
          <ul className="dashboard-favorite-list">
            {favorites.map((favorite) => {
              const template = templateRecord(favorite.templates as TemplateRecord);
              return (
                <li key={favorite.id}>
                  <div><strong>{template?.title ?? "Template"}</strong><span>Saved {formatDate(favorite.created_at)}</span></div>
                  {template?.slug && (
                    <div className="dashboard-row-actions">
                      <Link className="dashboard-secondary-button" href={`/templates/${template.slug}`}>View template</Link>
                      <form action={removeFavoriteAction}>
                        <input name="favorite_id" type="hidden" value={favorite.id} />
                        <button className="dashboard-secondary-button" type="submit">Remove</button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {favorites.length === 50 && (
            <p className="dashboard-list-note">Showing your 50 most recently saved templates.</p>
          )}
        </section>
      ) : (
        <section className="dashboard-empty-state">
          <h2>Your favorites will live here</h2>
          <p>Save templates you like so they&apos;re easy to find next time.</p>
          <Link className="dashboard-primary-button" href="/templates">Browse templates</Link>
        </section>
      )}
    </main>
  );
}
