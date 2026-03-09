"use client";

import { useState } from "react";

export default function SavePlanForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");

    const payload = {
      planName: formData.get("planName"),
      scenarioName: formData.get("scenarioName"),
      annualSpending: Number(formData.get("annualSpending")),
      withdrawalRateBps: Number(formData.get("withdrawalRateBps")),
      currentInvestments: Number(formData.get("currentInvestments")),
      monthlyContribution: Number(formData.get("monthlyContribution")),
      expectedReturnBps: Number(formData.get("expectedReturnBps")),
      inflationBps: Number(formData.get("inflationBps")),
    };

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save plan");
      }

      setMessage("Plan saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-2xl border p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium">Plan name</label>
        <input
          name="planName"
          defaultValue="My FI Plan"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Scenario name</label>
        <input
          name="scenarioName"
          defaultValue="Base Case"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Annual spending</label>
        <input
          name="annualSpending"
          type="number"
          defaultValue={60000}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Withdrawal rate (bps)</label>
        <input
          name="withdrawalRateBps"
          type="number"
          defaultValue={400}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Current investments</label>
        <input
          name="currentInvestments"
          type="number"
          defaultValue={100000}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Monthly contribution</label>
        <input
          name="monthlyContribution"
          type="number"
          defaultValue={1500}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Expected return (bps)</label>
        <input
          name="expectedReturnBps"
          type="number"
          defaultValue={700}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Inflation (bps)</label>
        <input
          name="inflationBps"
          type="number"
          defaultValue={250}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg border px-4 py-2">
        {loading ? "Saving..." : "Save Plan"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}