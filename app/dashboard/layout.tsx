import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile, isAdminRole } from "@/lib/supabase/auth";
import { DashboardShell } from "./_components/dashboard-shell";

async function AuthenticatedDashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const account = await getAuthenticatedProfile();

  if (!account || !account.isActive) redirect("/login?error=account_disabled");
  if (isAdminRole(account.role)) redirect("/admin");

  return (
    <DashboardShell fullName={account.fullName}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout(props: LayoutProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <DashboardShell fullName="Your account">
          <main className="dashboard-content">
            <p role="status">Loading your dashboard...</p>
          </main>
        </DashboardShell>
      }
    >
      <AuthenticatedDashboardLayout {...props} />
    </Suspense>
  );
}
