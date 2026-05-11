import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getProfileDisplayName } from "@/lib/dashboard/profile-display-name";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const gate = await requireUserWithOrg();

  if (!gate.ok) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  const user = gate.session.user;
  const profileName = getProfileDisplayName(user);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardShell profileName={profileName} userEmail={user.email ?? ""}>
        {children}
      </DashboardShell>
    </div>
  );
}
