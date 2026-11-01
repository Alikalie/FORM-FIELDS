import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAuthenticatedProfile, isAdminRole } from "@/lib/supabase/auth";
import { AdminShell } from "../_components/admin-shell";

async function AdminAccess({ children }: LayoutProps<"/admin">) {
  await connection();
  const account = await getAuthenticatedProfile();

  if (!account || !account.isActive) redirect("/admin/login");
  if (!isAdminRole(account.role)) redirect("/dashboard");

  return <AdminShell fullName={account.fullName} role={account.role}>{children}</AdminShell>;
}

export default function AdminLayout(props: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<main className="admin-loading" role="status">Loading admin console...</main>}>
      <AdminAccess {...props} />
    </Suspense>
  );
}
