const bearerRegex = /^Bearer\s+(\S+)/i;

export function extractBearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization")?.trim() ?? "";
  const match = bearerRegex.exec(raw);
  const token = match?.[1] ?? "";
  return token.length > 0 ? token : null;
}
