import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        DocRail
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Enterprise documents from structured data
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        API, templates, PDF generation, and delivery—built step by step. Follow public{" "}
        <Link href="/releases" className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400">
          release notes
        </Link>{" "}
        for user-visible changes.
      </p>
    </main>
  );
}
