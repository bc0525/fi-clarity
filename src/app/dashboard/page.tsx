import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SavePlanForm from "./save-plan-form";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">FI Clarity Dashboard</h1>
      <SavePlanForm />
    </main>
  );
}