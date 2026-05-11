import Link from "next/link";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export async function AuthLinks() {
  if (!getSupabasePublicEnv()) {
    return (
      <span className="text-zinc-500" title="Set NEXT_PUBLIC_SUPABASE_* in .env.local">
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
      <span className="space-x-4">
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          Sign in
        </Link>
      </span>
    );
  }

  return (
    <form action="/auth/signout" method="post" className="inline">
      <button
        type="submit"
        className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
      >
        Sign out
      </button>
    </form>
  );
}
