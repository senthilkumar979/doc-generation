"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { isInternalRouteChangeClick } from "@/lib/navigation/internal-link-click";

interface RouteTransitionContextValue {
  beginNavigation: () => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function useRouteTransition(): RouteTransitionContextValue {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) return { beginNavigation: () => {} };
  return ctx;
}

const STUCK_MS = 12_000;

export function RouteProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStuckTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const beginNavigation = useCallback(() => {
    clearStuckTimeout();
    setActive(true);
    timeoutRef.current = setTimeout(() => {
      setActive(false);
      timeoutRef.current = null;
    }, STUCK_MS);
  }, [clearStuckTimeout]);

  useEffect(() => {
    setActive(false);
    clearStuckTimeout();
  }, [pathname, searchKey, clearStuckTimeout]);

  useEffect(() => {
    function onClickCapture(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalRouteChangeClick(anchor, event)) return;
      beginNavigation();
    }

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [beginNavigation]);

  const value = useMemo(() => ({ beginNavigation }), [beginNavigation]);

  return (
    <RouteTransitionContext.Provider value={value}>
      {active ? (
        <div
          className="pointer-events-none fixed top-0 right-0 left-0 z-[200] h-[2px] overflow-hidden bg-primary/20"
          role="progressbar"
          aria-label="Loading page"
        >
          <div className="route-progress-shuttle absolute h-full w-1/3 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
        </div>
      ) : null}
      {children}
    </RouteTransitionContext.Provider>
  );
}
