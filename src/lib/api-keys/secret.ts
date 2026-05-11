import { createHash, randomBytes } from "node:crypto";

const PREFIX = "docr_live_";
const RANDOM_BYTES = 24;
export const API_KEY_PREFIX_DISPLAY_LEN = 24;

export function buildApiKeyPlaintext(): string {
  return PREFIX + randomBytes(RANDOM_BYTES).toString("base64url");
}

export function hashApiKeySecret(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function formatApiKeyPrefix(plaintext: string): string {
  if (plaintext.length <= API_KEY_PREFIX_DISPLAY_LEN) return plaintext;
  return plaintext.slice(0, API_KEY_PREFIX_DISPLAY_LEN);
}
