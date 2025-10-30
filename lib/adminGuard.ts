import { NextResponse } from "next/server";
import { validateAdminToken } from "./auth";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json({ error: "未授权访问" }, { status: 401 });
  }

  const admin = await validateAdminToken(token);
  if (!admin) {
    return NextResponse.json({ error: "授权已失效，请重新登录" }, { status: 401 });
  }

  return null;
}
