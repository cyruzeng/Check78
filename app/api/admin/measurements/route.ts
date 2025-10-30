import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const url = new URL(request.url);
  const search = url.searchParams.get("q");
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { normalizedName: { contains: search.toLowerCase() } }
        ]
      }
    : {};

  const measurements = await prisma.measurement.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json(measurements);
}
