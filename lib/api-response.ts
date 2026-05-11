import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "Request failed") {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("MONGODB_URI") ? 500 : 400;
  return NextResponse.json({ error: message }, { status });
}
