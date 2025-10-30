import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeInput } from "@/lib/measurement";

const uploadSchema = z.object({
  name: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, "请输入有效的名字").max(100, "名字过长")),
  upload: z.boolean().default(true)
});

const DEFAULT_LIMIT = 50;

function responseFromMeasurement(measurement: {
  id: string;
  name: string;
  value: number;
  listed: boolean;
}) {
  return {
    measurementId: measurement.id,
    name: measurement.name,
    value: measurement.value,
    listed: measurement.listed
  };
}

export async function GET() {
  const [ascending, descending] = await Promise.all([
    prisma.measurement.findMany({
      where: { listed: true },
      orderBy: { value: "asc" },
      take: DEFAULT_LIMIT,
      select: {
        id: true,
        name: true,
        value: true,
        listedAt: true
      }
    }),
    prisma.measurement.findMany({
      where: { listed: true },
      orderBy: { value: "desc" },
      take: DEFAULT_LIMIT,
      select: {
        id: true,
        name: true,
        value: true,
        listedAt: true
      }
    })
  ]);

  return NextResponse.json({
    ascending,
    descending
  });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { name, upload } = uploadSchema.parse(json);
    const normalized = normalizeInput(name);

    const measurement = await prisma.measurement.findUnique({
      where: { normalizedName: normalized }
    });

    if (!measurement) {
      return NextResponse.json(
        { error: "尚未进行测量，无法上传排行榜。" },
        { status: 404 }
      );
    }

    const updated = await prisma.measurement.update({
      where: { id: measurement.id },
      data: {
        listed: upload,
        listedAt: upload ? new Date() : null
      }
    });

    return NextResponse.json(responseFromMeasurement(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[leaderboard] unexpected", error);
    return NextResponse.json({ error: "内部服务错误" }, { status: 500 });
  }
}
