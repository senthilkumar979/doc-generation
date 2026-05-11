"use client";

import { useLinkStatus } from "next/link";

/** Must render inside a Next.js `<Link>` descendant tree. Shows while the destination RSC payload is loading. */
export function LinkNavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-accent/45 ring-inset"
      aria-hidden
    />
  );
}
