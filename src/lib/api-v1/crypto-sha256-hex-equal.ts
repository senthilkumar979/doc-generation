import { timingSafeEqual } from "node:crypto";

export function timingSafeSha256HexEqual(aHex: string, bHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(aHex) || !/^[a-f0-9]{64}$/i.test(bHex)) return false;

  try {
    const a = Buffer.from(aHex.toLowerCase(), "hex");
    const b = Buffer.from(bHex.toLowerCase(), "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
