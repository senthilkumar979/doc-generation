import { redirect } from "next/navigation";

export default function DashboardApiKeysRedirectPage() {
  redirect("/dashboard/settings/api-keys");
}
