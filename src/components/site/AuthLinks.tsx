import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export async function AuthLinks() {
  if (!getSupabasePublicEnv()) {
    return (
      <span className="text-muted-foreground text-xs" title="Set NEXT_PUBLIC_SUPABASE_* in .env.local">
        Auth not configured
      </span>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <span className="flex gap-4">
        <TextLink href="/signup" variant="foreground">
          Sign up
        </TextLink>
        <TextLink href="/login" variant="foreground">
          Sign in
        </TextLink>
      </span>
    );
  }

  return (
    <form action="/auth/signout" method="post" className="inline">
      <Button variant="ghost" size="sm" type="submit" className="text-accent hover:bg-transparent hover:text-accent/90 hover:underline">
        Sign out
      </Button>
    </form>
  );
}
