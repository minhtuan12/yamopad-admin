export const ADMIN_SESSION_COOKIE = "manitosilk_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  exp: number;
};

type AdminSessionCookie = {
  name: typeof ADMIN_SESSION_COOKIE;
  value: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

function getCrypto() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto API is unavailable");
  }
  return cryptoApi;
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function sign(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await getCrypto().subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await getCrypto().subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createAdminSessionCookie(
  username: string,
  secret: string,
  expiresAt = Date.now() + SESSION_TTL_MS
): Promise<AdminSessionCookie> {
  const payload = base64UrlEncode(JSON.stringify({ sub: username, exp: expiresAt } satisfies SessionPayload));
  const signature = await sign(payload, secret);

  return {
    name: ADMIN_SESSION_COOKIE,
    value: `${payload}.${signature}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  };
}

export async function verifyAdminSessionCookie(value: string | undefined, secret: string | undefined) {
  if (!value || !secret) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = await sign(payload, secret);
  if (signature !== expectedSignature) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as Partial<SessionPayload>;
    return typeof decoded.sub === "string" && typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}
