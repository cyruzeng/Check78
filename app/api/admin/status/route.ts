import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.admin.count();
  return NextResponse.json({ ready: count > 0 });
}
