import { markContactMessageHandledAction } from "@/app/actions/admin";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const account = await getAuthenticatedProfile();
  if (!account) return null;

  const [{ data: messages, error, count }, query] = await Promise.all([
    account.supabase
      .from("contact_messages")
      .select("id, user_id, name, email, subject, message, status, created_at", { count: "planned" })
      .order("created_at", { ascending: false })
      .limit(50),
    searchParams,
  ]);

  return (
    <main className="admin-content">
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CUSTOMER SUPPORT</div><h1>Contact messages</h1><p>Review incoming messages and mark them handled.</p></div><span className="admin-record-count">{count ?? "—"} messages</span></header>
      {query.updated === "handled" && <p className="admin-success" role="status">Message marked handled.</p>}
      {query.updated === "reopened" && <p className="admin-success" role="status">Message reopened.</p>}
      {error ? (
        <section className="admin-error" role="alert"><strong>Could not load messages.</strong><p>{error.message}</p><small>Apply the admin management migration if the contact table is not configured.</small></section>
      ) : messages.length ? (
        <section className="admin-message-list" aria-label="Messages stored in Supabase">
          {messages.map((message) => (
            <article className={`admin-message-card${message.status === "handled" ? " is-handled" : ""}`} key={message.id}>
              <header className="admin-message-card-heading">
                <div>
                  <span className="admin-message-topic">{message.subject.replaceAll("_", " ")}</span>
                  <h2>{message.name}</h2>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                <div className="admin-message-meta">
                  <span className={`admin-message-status${message.status === "handled" ? " is-handled" : ""}`}>
                    {message.status === "handled" ? "Handled" : "Needs review"}
                  </span>
                  <time dateTime={message.created_at}>
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.created_at))}
                  </time>
                </div>
              </header>
              <p className="admin-message-body">{message.message}</p>
              <footer className="admin-message-card-footer">
                <span>Saved in Supabase · {message.user_id ? "Signed-in customer" : "Guest message"}</span>
                <form action={markContactMessageHandledAction}>
                  <input name="id" type="hidden" value={message.id} />
                  <input name="handled" type="hidden" value={message.status !== "handled" ? "on" : "off"} />
                  <button className="admin-row-action-button" type="submit">{message.status === "handled" ? "Reopen message" : "Mark handled"}</button>
                </form>
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <section className="admin-empty-state"><h2>No messages yet</h2><p>New contact form submissions will appear here.</p></section>
      )}
    </main>
  );
}
