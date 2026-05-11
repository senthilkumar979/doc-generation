import { NextResponse } from "next/server";

export function jsonUnauthorized(message = "Missing or invalid API key") {
  return NextResponse.json({ error: { message } }, { status: 401 });
}

export function jsonBadRequest(message: string) {
  return NextResponse.json({ error: { message } }, { status: 400 });
}

export function jsonNotFound(message: string) {
  return NextResponse.json({ error: { message } }, { status: 404 });
}

export function jsonServiceUnavailable() {
  return NextResponse.json(
    {
      error: {
        message:
          "Service role Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for /api/v1.",
      },
    },
    { status: 503 },
  );
}

export function jsonNotImplemented(message: string, code?: string) {
  return NextResponse.json({ error: { message, ...(code ? { code } : {}) } }, { status: 501 });
}
