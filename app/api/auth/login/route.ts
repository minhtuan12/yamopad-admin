import { NextResponse } from "next/server";
import { createAdminSessionCookie } from "../../../../lib/auth-session";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const { username, password } = (await request.json().catch(() => ({}))) as LoginPayload;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return NextResponse.json({ error: "Đã có lỗi xảy ra, vui lòng thử lại" }, { status: 500 });
  }

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const cookie = await createAdminSessionCookie(adminUsername, sessionSecret);
  response.cookies.set(cookie);
  return response;
}
