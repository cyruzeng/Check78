import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { normalizeInput } from "@/lib/measurement";

const createSchema = z.object({
  value: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, "请输入违禁字符串").max(100, "字符串过长")),
  reason: z
    .string()
    .trim()
    .max(200, "备注过长")
    .optional()
});

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const banned = await prisma.bannedName.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(banned);
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const json = await request.json();
    const { value, reason } = createSchema.parse(json);
    const normalizedValue = normalizeInput(value);

    const banned = await prisma.bannedName.upsert({
      where: { normalizedValue },
      update: {
        value,
        reason
      },
      create: {
        value,
        normalizedValue,
        reason
      }
    });

    return NextResponse.json(banned, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[admin:banned:create]", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
