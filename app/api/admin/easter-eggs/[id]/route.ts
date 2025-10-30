import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    await prisma.easterEgg.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin:easter-eggs:delete]", error);
    return NextResponse.json(
      { error: "无法删除指定彩蛋" },
      { status: 400 }
    );
  }
}
