"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon } from "./dashboard-icon";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/downloads", label: "My Downloads", icon: "download" },
  { href: "/dashboard/purchases", label: "My Purchases", icon: "cart" },
  { href: "/dashboard/favorites", label: "My Favorites", icon: "heart" },
  { href: "/dashboard/profile", label: "Profile", icon: "user" },
] as const;

export function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Customer dashboard">
      {navigation.map(({ href, label, icon }) => (
        <Link
          aria-current={pathname === href ? "page" : undefined}
          className={`dashboard-nav-link${pathname === href ? " active" : ""}`}
          href={href}
          key={href}
        >
          <DashboardIcon name={icon} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
