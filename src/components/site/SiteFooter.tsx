import Link from "next/link";

import { AuthLinks } from "@/components/site/AuthLinks";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        <AuthLinks />
        <Link
          href="/releases"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          Release notes
        </Link>
      </div>
    </footer>
  );
}
