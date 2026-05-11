import { redirect } from "next/navigation";

/** Canonical change-password UI lives at `/dashboard/password`. */
export default function SettingsPasswordRedirectPage() {
  redirect("/dashboard/password");
}
