import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

const sections = {
  templates: {
    title: "Templates",
    description: "Review template listings, prices and publication status.",
    table: "templates",
  },
  categories: {
    title: "Categories",
    description: "Review the categories shown in the marketplace.",
    table: "categories",
  },
  users: {
    title: "Users",
    description: "Review customer profile records and assigned roles.",
    table: "profiles",
  },
  purchases: {
    title: "Purchases",
    description: "Review recorded customer purchases and order statuses.",
    table: "purchases",
  },
  downloads: {
    title: "Downloads",
    description: "Review recorded template downloads.",
    table: "downloads",
  },
  messages: {
    title: "Messages",
    description: "Review messages submitted through the contact form.",
    table: "contact_messages",
  },
  content: {
    title: "Site Content",
    description: "Manage the shared content used across marketplace pages.",
    table: null,
  },
} as const;

type AdminSection = keyof typeof sections;

function isAdminSection(value: string): value is AdminSection {
  return value in sections;
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (row): row is Record<string, unknown> =>
      typeof row === "object" && row !== null && !Array.isArray(row),
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function AdminSectionPage({
  params,
}: PageProps<"/admin/[section]">) {
  const { section } = await params;
  if (!isAdminSection(section)) notFound();

  const definition = sections[section];
  if (!definition.table) {
    return (
      <main className="admin-content">
        <Link className="admin-back-link" href="/admin">← Admin overview</Link>
        <header className="admin-page-heading">
          <div><div className="admin-eyebrow">ADMIN WORKSPACE</div><h1>{definition.title}</h1><p>{definition.description}</p></div>
        </header>
        <section className="admin-empty-state">
          <span aria-hidden="true">▧</span>
          <h2>Content management is not configured yet</h2>
          <p>There is no site-content table in the connected Supabase schema. The admin screen is ready, but content editing needs a CMS table and access policies first.</p>
        </section>
      </main>
    );
  }

  const account = await getAuthenticatedProfile();
  if (!account) return null;

  let data: unknown = null;
  let queryError: string | null = null;
  let count: number | null = null;

  switch (section) {
    case "templates": {
      const result = await account.supabase.from("templates").select("*", { count: "planned" }).order("created_at", { ascending: false }).limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "categories": {
      const result = await account.supabase.from("categories").select("*", { count: "planned" }).order("name").limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "users": {
      const result = await account.supabase.from("profiles").select("*", { count: "planned" }).order("created_at", { ascending: false }).limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "purchases": {
      const result = await account.supabase.from("purchases").select("*, templates(title, slug)", { count: "planned" }).order("created_at", { ascending: false }).limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "downloads": {
      const result = await account.supabase.from("downloads").select("*, templates(title, slug)", { count: "planned" }).order("downloaded_at", { ascending: false }).limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "messages": {
      const result = await account.supabase.from("contact_messages").select("*", { count: "planned" }).limit(25);
      data = result.data;
      queryError = result.error?.message ?? null;
      count = result.count;
      break;
    }
    case "content":
      notFound();
  }

  const rows = toRows(data);
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin">← Admin overview</Link>
      <header className="admin-page-heading">
        <div>
          <div className="admin-eyebrow">ADMIN WORKSPACE</div>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
        <span className="admin-record-count">About {count ?? "—"} records</span>
      </header>

      {queryError ? (
        <section className="admin-error" role="alert">
          <strong>Could not load {definition.title.toLowerCase()}.</strong>
          <p>{queryError}</p>
          <small>Check the table&apos;s Supabase row-level security policies for admin access.</small>
        </section>
      ) : rows.length === 0 ? (
        <section className="admin-empty-state">
          <span aria-hidden="true">▤</span>
          <h2>No {definition.title.toLowerCase()} to display</h2>
          <p>The table is available, but no records are visible to this admin account.</p>
        </section>
      ) : (
        <section className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-record-table">
              <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={typeof row.id === "string" ? row.id : `${section}-${index}`}>
                    {columns.map((column) => <td key={column}>{formatCell(row[column])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {count !== null && count > rows.length && (
            <p className="admin-table-note">Showing the first {rows.length} records. The total is an estimate.</p>
          )}
        </section>
      )}
    </main>
  );
}
