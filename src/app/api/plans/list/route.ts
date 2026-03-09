import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      include: { scenarios: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("GET /api/plans/list error", error);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }
}