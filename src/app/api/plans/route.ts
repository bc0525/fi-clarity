import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-or-create-user";

type CreatePlanBody = {
  planName?: string;
  scenarioName?: string;
  annualSpending?: number;
  withdrawalRateBps?: number;
  currentInvestments?: number;
  monthlyContribution?: number;
  expectedReturnBps?: number;
  inflationBps?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePlanBody;
    const user = await getOrCreateUser();

    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        name: body.planName?.trim() || "My First Plan",
        scenarios: {
          create: {
            name: body.scenarioName?.trim() || "Base Case",
            annualSpending: body.annualSpending ?? 60000,
            withdrawalRateBps: body.withdrawalRateBps ?? 400,
            currentInvestments: body.currentInvestments ?? 0,
            monthlyContribution: body.monthlyContribution ?? 0,
            expectedReturnBps: body.expectedReturnBps ?? 700,
            inflationBps: body.inflationBps ?? 250,
          },
        },
      },
      include: {
        scenarios: true,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans error", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}