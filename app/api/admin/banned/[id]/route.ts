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
    await prisma.bannedName.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin:banned:delete]", error);
    return NextResponse.json({ error: "无法删除违禁字符串" }, { status: 400 });
  }
}
