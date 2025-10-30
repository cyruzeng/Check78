import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  sessionExpiryDate
} from "@/lib/auth";

const initSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "用户名至少 3 个字符")
    .max(30, "用户名过长")
    .regex(/^[a-zA-Z0-9_\-]+$/, "仅支持字母、数字、下划线与连字符"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .max(100, "密码过长")
});

export async function POST(request: Request) {
  const existing = await prisma.admin.count();
  if (existing > 0) {
    return NextResponse.json(
      { error: "管理员已存在" },
      { status: 409 }
    );
  }

  try {
    const json = await request.json();
    const { username, password } = initSchema.parse(json);

    const passwordHash = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash
      }
    });

    const token = createSessionToken();
    const expiresAt = sessionExpiryDate();

    await prisma.adminSession.create({
      data: {
        token,
        expiresAt,
        adminId: admin.id
      }
    });

    return NextResponse.json({
      message: "管理员初始化成功",
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[admin:init]", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
