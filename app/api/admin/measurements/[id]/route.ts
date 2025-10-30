import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { normalizeInput } from "@/lib/measurement";

const updateSchema = z.object({
  value: z
    .number({ required_error: "value is required" })
    .int("必须是整数")
    .min(-9999, "超出允许范围")
    .max(9999, "超出允许范围"),
  name: z
    .string()
    .trim()
    .min(1, "名字不可为空")
    .max(100, "名字过长")
    .optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const json = await request.json();
    const { value, name } = updateSchema.parse(json);

    const data: {
      value: number;
      name?: string;
      normalizedName?: string;
    } = { value };
    if (name) {
      data.name = name;
      data.normalizedName = normalizeInput(name);
    }

    const measurement = await prisma.measurement.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(measurement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[admin:measurement:update]", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
