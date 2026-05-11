/**
 * True when a primary click on this anchor should run a client-side route change
 * to a different pathname/query than the current location (DocRail in-app).
 */
export function isInternalRouteChangeClick(anchor: HTMLAnchorElement, event: MouseEvent): boolean {
  if (event.defaultPrevented) return false;
  if (event.type !== "click") return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const hrefAttr = anchor.getAttribute("href");
  if (hrefAttr == null || hrefAttr === "" || hrefAttr.startsWith("#")) return false;
  if (hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:") || hrefAttr.startsWith("javascript:")) {
    return false;
  }

  const targetAttr = anchor.getAttribute("target");
  if (targetAttr && targetAttr !== "" && targetAttr !== "_self") return false;

  if (anchor.hasAttribute("download")) return false;

  let url: URL;
  try {
    url = new URL(hrefAttr, globalThis.location.href);
  } catch {
    return false;
  }

  if (url.origin !== globalThis.location.origin) return false;

  const next = `${url.pathname}${url.search}`;
  const cur = `${globalThis.location.pathname}${globalThis.location.search}`;
  if (next === cur) return false;

  return true;
}
