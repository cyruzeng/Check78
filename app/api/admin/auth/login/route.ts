import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  sessionExpiryDate,
  verifyPassword
} from "@/lib/auth";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "请输入用户名")
    .max(30, "用户名过长"),
  password: z.string().min(1, "请输入密码")
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { username, password } = loginSchema.parse(json);

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json(
        { error: "账户不存在" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const expiresAt = sessionExpiryDate();

    await prisma.adminSession.create({
      data: {
        token,
        expiresAt,
        adminId: admin.id
      }
    });

    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[admin:login]", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
