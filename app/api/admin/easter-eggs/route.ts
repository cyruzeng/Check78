import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { normalizeInput } from "@/lib/measurement";

const createSchema = z.object({
  trigger: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, "请输入触发字符串").max(100, "字符串过长")),
  value: z
    .number({ required_error: "value is required" })
    .int("必须是整数")
    .min(-9999, "数值过小")
    .max(9999, "数值过大"),
  note: z
    .string()
    .trim()
    .max(200, "备注过长")
    .optional()
});

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const eggs = await prisma.easterEgg.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(eggs);
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const json = await request.json();
    const { trigger, value, note } = createSchema.parse(json);
    const normalizedTrigger = normalizeInput(trigger);

    const egg = await prisma.easterEgg.upsert({
      where: { normalizedTrigger },
      update: {
        trigger,
        value,
        note
      },
      create: {
        trigger,
        normalizedTrigger,
        value,
        note
      }
    });

    return NextResponse.json(egg, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[admin:easter-eggs:create]", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
