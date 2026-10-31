"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "../actions/auth";

export function SiteHeaderNavigation({
  brand,
  dashboardHref,
  labels,
}: {
  brand: ReactNode;
  dashboardHref?: "/dashboard" | "/admin";
  labels: {
    templates: string;
    categories: string;
    howItWorks: string;
  };
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      {brand}
      <div
        className={`mobile-menu-panel${menuOpen ? " is-open" : ""}`}
        id="mobile-navigation"
      >
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/templates" onClick={() => setMenuOpen(false)}>{labels.templates}</Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>{labels.categories}</Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>{labels.howItWorks}</Link>
        </nav>
        <div className="mobile-auth-links">
          {dashboardHref ? (
            <>
              <Link className="mobile-login-link" href={dashboardHref} onClick={() => setMenuOpen(false)}>
                {dashboardHref === "/admin" ? "Admin" : "Dashboard"}
              </Link>
              <form action={logoutAction}>
                <button className="button button-small button-primary" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link className="mobile-login-link" href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link className="button button-small button-primary" href="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      </div>
      <div className="header-actions">
        {dashboardHref ? (
          <>
            <Link className="login-link" href={dashboardHref}>
              {dashboardHref === "/admin" ? "Admin" : "Dashboard"}
            </Link>
            <form action={logoutAction}>
              <button className="button button-small button-primary" type="submit">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link className="login-link" href="/login">Log in</Link>
            <Link className="button button-small button-primary" href="/signup">Sign up</Link>
          </>
        )}
      </div>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        className={`menu-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
