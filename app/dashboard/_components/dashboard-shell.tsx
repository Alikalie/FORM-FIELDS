import type { ReactNode } from "react";
import { FormFieldsLogo } from "../../components/form-fields-logo";
import { LogoutButton } from "../../components/logout-button";
import { DashboardIcon } from "./dashboard-icon";
import { DashboardNavigation } from "./dashboard-navigation";

export function DashboardShell({
  children,
  fullName,
}: {
  children: ReactNode;
  fullName: string;
}) {
  return (
    <div className="customer-dashboard">
      <aside className="dashboard-sidebar">
        <FormFieldsLogo
          className="dashboard-brand"
          subtitle="Professional templates"
        />
        <DashboardNavigation />
        <div className="dashboard-sidebar-logout"><LogoutButton /></div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <span className="dashboard-topbar-label">CUSTOMER DASHBOARD</span>
          <div className="dashboard-user-chip">
            <span className="dashboard-user-avatar"><DashboardIcon name="user" /></span>
            <span>{fullName}</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
