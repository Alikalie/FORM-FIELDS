import Link from "next/link";
import type { ReactNode } from "react";
import { FormFieldsLogo } from "../../components/form-fields-logo";
import { LogoutButton } from "../../components/logout-button";

const links = [
  ["Dashboard", "/admin", "⌂"],
  ["Templates", "/admin/templates", "▤"],
  ["Categories", "/admin/categories", "▦"],
  ["Users", "/admin/users", "♙"],
  ["Purchases", "/admin/purchases", "◇"],
  ["Downloads", "/admin/downloads", "↓"],
  ["Favorites / Activity", "/admin/activity", "♡"],
  ["Reviews", "/admin/reviews", "☆"],
  ["Messages", "/admin/messages", "✉"],
  ["Site Content", "/admin/content", "▧"],
] as const;

export function AdminShell({
  children,
  fullName,
  role,
}: {
  children: ReactNode;
  fullName: string;
  role: string;
}) {
  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <FormFieldsLogo className="admin-brand" subtitle="ADMIN CONSOLE" />
        <nav aria-label="Administration">
          {links.map(([label, href, icon]) => (
            <Link href={href} key={href}>
              <span aria-hidden="true">{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-logout"><LogoutButton /></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <Link href="/">Open storefront</Link>
          <span className="admin-role-badge">{role.replace("_", " ")}</span>
          <span className="admin-user">{fullName}</span>
        </header>
        {children}
      </div>
    </div>
  );
}
