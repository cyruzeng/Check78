import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ready: false });
  }

  try {
    const count = await prisma.admin.count();
    return NextResponse.json({ ready: count > 0 });
  } catch (error) {
    console.error("Failed to query admin readiness", error);
    return NextResponse.json({ ready: false }, { status: 200 });
  }
}
