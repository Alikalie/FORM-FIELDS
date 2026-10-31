import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { DashboardIcon } from "./_components/dashboard-icon";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTemplateTitle(template: unknown) {
  const record = Array.isArray(template) ? template[0] : template;
  if (
    record &&
    typeof record === "object" &&
    "title" in record &&
    typeof record.title === "string"
  ) {
    return record.title;
  }
  return "Template";
}

export default async function DashboardPage() {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const { supabase, user } = account;
  const [
    usedResult,
    remainingResult,
    downloadCountResult,
    purchaseCountResult,
    favoriteCountResult,
    recentDownloadsResult,
  ] = await Promise.all([
    supabase.rpc("get_free_downloads_used"),
    supabase.rpc("get_free_downloads_remaining"),
    supabase.from("downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("downloads")
      .select("id, downloaded_at, templates(title)")
      .eq("user_id", user.id)
      .order("downloaded_at", { ascending: false })
      .limit(5),
  ]);

  const errors = [
    usedResult.error && `Free downloads used: ${usedResult.error.message}`,
    remainingResult.error && `Free downloads remaining: ${remainingResult.error.message}`,
    downloadCountResult.error && `Downloads: ${downloadCountResult.error.message}`,
    purchaseCountResult.error && `Purchases: ${purchaseCountResult.error.message}`,
    favoriteCountResult.error && `Favorites: ${favoriteCountResult.error.message}`,
    recentDownloadsResult.error && `Recent activity: ${recentDownloadsResult.error.message}`,
  ].filter((message): message is string => Boolean(message));

  return (
    <main className="dashboard-content">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <h1>Welcome back, {account.fullName}!</h1>
          <p>Here&apos;s a summary of your templates, downloads and account.</p>
        </div>
        <div aria-hidden="true" className="dashboard-hero-art">
          <div className="dashboard-hero-document"><span /><span /><span /><span /></div>
          <span className="dashboard-hero-download"><DashboardIcon name="download" /></span>
          <i>✦</i><b>✧</b>
        </div>
      </section>

      {errors.length > 0 && (
        <div className="dashboard-errors" role="alert">
          <strong>Some dashboard information couldn&apos;t be loaded.</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      <section aria-label="Account overview" className="dashboard-stat-grid">
        <Link className="dashboard-stat" href="/dashboard/downloads">
          <span className="dashboard-stat-icon blue"><DashboardIcon name="download" /></span>
          <h2>Free Downloads</h2>
          <strong>3</strong>
          <p>Total available</p>
        </Link>
        <Link className="dashboard-stat" href="/dashboard/downloads">
          <span className="dashboard-stat-icon green"><DashboardIcon name="download" /></span>
          <h2>Remaining Downloads</h2>
          <strong>{remainingResult.error ? "—" : remainingResult.data ?? "—"}</strong>
          <p>You can still download</p>
        </Link>
        <Link className="dashboard-stat" href="/dashboard/downloads">
          <span className="dashboard-stat-icon purple"><DashboardIcon name="shield" /></span>
          <h2>Used Downloads</h2>
          <strong>{usedResult.error ? "—" : usedResult.data ?? "—"}</strong>
          <p>Already used</p>
        </Link>
        <Link className="dashboard-stat" href="/dashboard/purchases">
          <span className="dashboard-stat-icon orange"><DashboardIcon name="cart" /></span>
          <h2>Purchased Templates</h2>
          <strong>{purchaseCountResult.error ? "—" : purchaseCountResult.count ?? 0}</strong>
          <p>Total purchases</p>
        </Link>
      </section>

      <div className="dashboard-primary-grid">
        <section className="dashboard-card">
          <div className="dashboard-card-heading">
            <h2><DashboardIcon name="clock" /> Recent Activity</h2>
            <Link href="/dashboard/downloads">View downloads <DashboardIcon name="chevron" /></Link>
          </div>
          {recentDownloadsResult.error ? (
            <p className="dashboard-empty">Recent activity could not be loaded.</p>
          ) : recentDownloadsResult.data.length ? (
            <ul className="dashboard-activity-list">
              {recentDownloadsResult.data.map((download) => (
                <li key={download.id}>
                  <span className="dashboard-activity-icon"><DashboardIcon name="download" /></span>
                  <span>Downloaded {getTemplateTitle(download.templates)}</span>
                  <time dateTime={download.downloaded_at}>{formatDateTime(download.downloaded_at)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty">Your recent activity will appear here.</p>
          )}
        </section>

        <section className="dashboard-card dashboard-quick-actions">
          <div className="dashboard-card-heading"><h2><DashboardIcon name="bolt" /> Quick Actions</h2></div>
          <Link href="/templates"><DashboardIcon name="grid" /><span>Browse Templates</span><DashboardIcon name="chevron" /></Link>
          <Link href="/dashboard/downloads"><DashboardIcon name="download" /><span>My Downloads ({downloadCountResult.count ?? 0})</span><DashboardIcon name="chevron" /></Link>
          <Link href="/dashboard/purchases"><DashboardIcon name="cart" /><span>View My Purchases</span><DashboardIcon name="chevron" /></Link>
          <Link href="/dashboard/favorites"><DashboardIcon name="heart" /><span>Manage Favorites ({favoriteCountResult.count ?? 0})</span><DashboardIcon name="chevron" /></Link>
          <Link href="/dashboard/profile"><DashboardIcon name="user" /><span>View Profile</span><DashboardIcon name="chevron" /></Link>
        </section>
      </div>

      <section className="dashboard-card dashboard-summary-profile">
        <div className="dashboard-card-heading">
          <h2><DashboardIcon name="user" /> Account Information</h2>
          <Link href="/dashboard/profile">View profile <DashboardIcon name="chevron" /></Link>
        </div>
        <dl className="dashboard-account-details">
          <div><dt>Full Name</dt><dd>{account.fullName}</dd></div>
          <div><dt>Email Address</dt><dd>{user.email}</dd></div>
          <div><dt>Account Status</dt><dd><span className="dashboard-account-status">{user.email_confirmed_at ? "Active" : "Unverified"}</span></dd></div>
          <div><dt>Member Since</dt><dd>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(account.createdAt))}</dd></div>
        </dl>
      </section>
    </main>
  );
}
