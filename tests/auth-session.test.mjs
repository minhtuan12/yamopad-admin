import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionCookie,
  verifyAdminSessionCookie
} from "../dist-test/lib/auth-session.js";

const secret = "test-secret-with-enough-length";

test("creates a named admin session cookie that verifies with the same secret", async () => {
  const cookie = await createAdminSessionCookie("admin", secret);

  assert.equal(cookie.name, ADMIN_SESSION_COOKIE);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, "lax");
  assert.equal(cookie.path, "/");
  assert.equal(await verifyAdminSessionCookie(cookie.value, secret), true);
});

test("rejects tampered admin session cookies", async () => {
  const cookie = await createAdminSessionCookie("admin", secret);
  const tampered = cookie.value.replace(/.$/, "x");

  assert.equal(await verifyAdminSessionCookie(tampered, secret), false);
});

test("rejects expired admin session cookies", async () => {
  const cookie = await createAdminSessionCookie("admin", secret, Date.now() - 1000);

  assert.equal(await verifyAdminSessionCookie(cookie.value, secret), false);
});
