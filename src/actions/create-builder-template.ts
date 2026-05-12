"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

export async function createBuilderTemplateAction() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) redirect("/onboarding/organization");

  const name = `Untitled builder template ${new Date().toISOString()}`;
  const { data, error } = await supabase
    .from("templates")
    .insert({
      org_id: orgId,
      name,
      description: "Built with the visual template editor",
      page_size: "A4",
      orientation: "portrait",
      schema: {},
    })
    .select("id")
    .single();

  if (error || !data?.id) redirect("/dashboard/templates?builderCreate=failed");

  revalidatePath("/dashboard/templates");
  redirect(`/dashboard/templates/${data.id}/edit`);
}
