import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createLengthComment,
  normalizeInput,
  randomLength
} from "@/lib/measurement";

const measureSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .transform((value) => value.trim())
    .pipe(z.string().min(1, "请输入有效的字符串").max(100, "字符长度过长"))
});

async function calculateRanks(value: number) {
  const [ascCount, descCount] = await Promise.all([
    prisma.measurement.count({
      where: {
        listed: true,
        value: { lt: value }
      }
    }),
    prisma.measurement.count({
      where: {
        listed: true,
        value: { gt: value }
      }
    })
  ]);

  return {
    ascending: ascCount + 1,
    descending: descCount + 1
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { name } = measureSchema.parse(json);
    const normalized = normalizeInput(name);

    const banned = await prisma.bannedName.findUnique({
      where: { normalizedValue: normalized }
    });

    if (banned) {
      return NextResponse.json(
        {
          error:
            banned.reason ??
            "该字符串已被管理员列为违禁，无法进行银河量测。"
        },
        { status: 403 }
      );
    }

    const egg = await prisma.easterEgg.findUnique({
      where: { normalizedTrigger: normalized }
    });

    let measurement = await prisma.measurement.findUnique({
      where: { normalizedName: normalized }
    });

    const targetValue = egg?.value ?? measurement?.value ?? randomLength();

    if (!measurement) {
      measurement = await prisma.measurement.create({
        data: {
          name,
          normalizedName: normalized,
          value: targetValue
        }
      });
    } else if (measurement.value !== targetValue) {
      measurement = await prisma.measurement.update({
        where: { id: measurement.id },
        data: { value: targetValue }
      });
    } else if (measurement.name !== name) {
      // keep the most recent casing the user input.
      measurement = await prisma.measurement.update({
        where: { id: measurement.id },
        data: { name }
      });
    }

    const ranks = await calculateRanks(measurement.value);

    return NextResponse.json({
      measurementId: measurement.id,
      name: measurement.name,
      value: measurement.value,
      listed: measurement.listed,
      comment: createLengthComment(measurement.value),
      ranks
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数校验失败" },
        { status: 400 }
      );
    }
    console.error("[measure] unexpected", error);
    return NextResponse.json({ error: "内部服务错误" }, { status: 500 });
  }
}
