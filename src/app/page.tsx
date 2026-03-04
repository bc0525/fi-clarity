"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { buildProjectionTable, Inputs } from "@/lib/calculations";
import { formatMoney } from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  CartesianGrid,
} from "recharts";

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <div className="text-sm text-gray-700 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-gray-500">{prefix}</span> : null}
        <input
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="text-gray-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  // Scenario A (live as you type)
  const [draft, setDraft] = useState<Inputs>({
    currentAge: 35,
    netWorth: 100000,
    annualSavings: 25000,
    annualSpending: 60000,
    expectedReturnPct: 7,
    swrPct: 4,
  });

  // Scenario compare
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [scenarioB, setScenarioB] = useState<
    Pick<Inputs, "annualSavings" | "annualSpending" | "expectedReturnPct">
  >({
    annualSavings: 35000,
    annualSpending: 60000,
    expectedReturnPct: 7,
  });

  // Validation (we still compute, but we message clearly)
  const errors: string[] = [];
  if (draft.annualSpending <= 0) errors.push("Annual spending must be greater than 0.");
  if (draft.swrPct <= 0) errors.push("Safe withdrawal rate must be greater than 0.");
  if (draft.currentAge <= 0 || draft.currentAge > 100) errors.push("Current age must be between 1 and 100.");

  const warnings: string[] = [];
  if (draft.swrPct < 2 || draft.swrPct > 6) warnings.push("SWR outside 2–6% is uncommon. Double-check your assumption.");
  if (draft.expectedReturnPct < 0 || draft.expectedReturnPct > 12)
    warnings.push("Return outside 0–12% may be unrealistic for long-term planning.");
  if (draft.annualSavings < 0) warnings.push("Negative annual savings will delay FI.");

  // Scenario A results (live)
  const resultsA = useMemo(() => buildProjectionTable(draft), [draft]);

  // Scenario B results (live, but only meaningful if compareEnabled)
  const inputsB: Inputs = useMemo(
    () => ({
      ...draft,
      annualSavings: scenarioB.annualSavings,
      annualSpending: scenarioB.annualSpending,
      expectedReturnPct: scenarioB.expectedReturnPct,
    }),
    [draft, scenarioB]
  );

  const resultsB = useMemo(() => (compareEnabled ? buildProjectionTable(inputsB) : null), [compareEnabled, inputsB]);

  // Merge chart data by age so we can render both series on the same chart easily
  const chartData = useMemo(() => {
    const a = resultsA.rows.map((r) => ({
      age: r.age + 1, // end-of-year age
      netWorthA: Math.round(r.netWorthEnd),
      fiTargetA: resultsA.fiTarget,
      isFiA: r.isFiReached,
    }));

    if (!compareEnabled || !resultsB) return a;

    const bMap = new Map<number, number>();
    const fiAgeB = resultsB.fiAge ?? null;

    for (const r of resultsB.rows) {
      bMap.set(r.age + 1, Math.round(r.netWorthEnd));
    }

    return a.map((row) => ({
      ...row,
      netWorthB: bMap.get(row.age) ?? null,
      fiTargetB: resultsB.fiTarget,
      fiAgeB,
    }));
  }, [resultsA, compareEnabled, resultsB]);

  // FI point markers (A and B)
  const fiPointA = useMemo(() => {
    const hit = resultsA.rows.find((r) => r.isFiReached);
    if (!hit) return null;
    return { age: hit.age + 1, netWorth: Math.round(hit.netWorthEnd) };
  }, [resultsA.rows]);

  const fiPointB = useMemo(() => {
    if (!compareEnabled || !resultsB) return null;
    const hit = resultsB.rows.find((r) => r.isFiReached);
    if (!hit) return null;
    return { age: hit.age + 1, netWorth: Math.round(hit.netWorthEnd) };
  }, [compareEnabled, resultsB]);

  // FI difference text
  const fiDiffText = useMemo(() => {
    if (!compareEnabled || !resultsB) return null;
    if (!resultsA.fiYear || !resultsB.fiYear) return "Scenario B does not reach FI by age 100 under these assumptions.";
    const diff = resultsB.fiYear - resultsA.fiYear;
    if (diff === 0) return "Scenario B reaches FI in the same year as Scenario A.";
    return `Scenario B reaches FI ${Math.abs(diff)} year${Math.abs(diff) === 1 ? "" : "s"} ${
      diff < 0 ? "earlier" : "later"
    } than Scenario A.`;
  }, [compareEnabled, resultsA.fiYear, resultsB]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="font-semibold tracking-tight">FI Clarity</div>
          <nav className="text-sm text-gray-600 flex items-center gap-5">
            <a className="hover:text-gray-900" href="#how">
              How it works
            </a>
            <a className="hover:text-gray-900" href="#pricing">
              Pricing
            </a>

            {!isLoaded ? (
              <div className="flex items-center gap-2 opacity-60">
                <button className="rounded-lg border border-gray-200 px-3 py-1.5" disabled>
                  Log in
                </button>
                <button className="rounded-lg bg-gray-900 text-white px-3 py-1.5" disabled>
                  Sign up
                </button>
              </div>
            ) : !isSignedIn ? (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                    Log in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a className="hover:text-gray-900" href="/dashboard">
                  Dashboard
                </a>
                <UserButton />
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Know your FI date — and what moves it.</h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            A transparent financial independence calculator built for serious planners. No hidden assumptions.
          </p>
          <p className="mt-3 text-xs text-gray-500">Disclaimer: Projections are informational and not financial advice.</p>
        </section>

        {/* App layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="font-medium mb-4">Inputs</div>

              <div className="space-y-4">
                <NumberInput
                  label="Current age"
                  value={draft.currentAge}
                  onChange={(v) => setDraft({ ...draft, currentAge: v })}
                  step={1}
                  min={1}
                  max={100}
                />
                <NumberInput
                  label="Current net worth"
                  value={draft.netWorth}
                  onChange={(v) => setDraft({ ...draft, netWorth: v })}
                  prefix="$"
                  step={1000}
                  min={0}
                />
                <NumberInput
                  label="Annual savings"
                  value={draft.annualSavings}
                  onChange={(v) => setDraft({ ...draft, annualSavings: v })}
                  prefix="$"
                  step={1000}
                />
                <NumberInput
                  label="Annual spending"
                  value={draft.annualSpending}
                  onChange={(v) => setDraft({ ...draft, annualSpending: v })}
                  prefix="$"
                  step={1000}
                  min={0}
                />
                <NumberInput
                  label="Expected annual return"
                  value={draft.expectedReturnPct}
                  onChange={(v) => setDraft({ ...draft, expectedReturnPct: v })}
                  suffix="%"
                  step={0.25}
                />
                <NumberInput
                  label="Safe withdrawal rate"
                  value={draft.swrPct}
                  onChange={(v) => setDraft({ ...draft, swrPct: v })}
                  suffix="%"
                  step={0.1}
                  min={0.1}
                />

                {/* Compare toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={compareEnabled}
                      onChange={(e) => setCompareEnabled(e.target.checked)}
                    />
                    Compare a second scenario
                  </label>
                </div>

                {compareEnabled ? (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                    <div className="text-sm font-medium">Scenario B</div>

                    <NumberInput
                      label="Annual savings (B)"
                      value={scenarioB.annualSavings}
                      onChange={(v) => setScenarioB({ ...scenarioB, annualSavings: v })}
                      prefix="$"
                      step={1000}
                    />

                    <NumberInput
                      label="Annual spending (B)"
                      value={scenarioB.annualSpending}
                      onChange={(v) => setScenarioB({ ...scenarioB, annualSpending: v })}
                      prefix="$"
                      step={1000}
                      min={0}
                    />

                    <NumberInput
                      label="Expected return (B)"
                      value={scenarioB.expectedReturnPct}
                      onChange={(v) => setScenarioB({ ...scenarioB, expectedReturnPct: v })}
                      suffix="%"
                      step={0.25}
                    />
                  </div>
                ) : null}

                {errors.length > 0 ? (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                    {errors.map((e) => (
                      <div key={e}>• {e}</div>
                    ))}
                  </div>
                ) : null}

                {warnings.length > 0 ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800">
                    {warnings.map((w) => (
                      <div key={w}>• {w}</div>
                    ))}
                  </div>
                ) : null}

                <div className="text-xs text-gray-500">
                  Pro ($5/mo) will later unlock sensitivity sliders, saved scenarios, and CSV export.
                </div>
              </div>
            </div>
          </div>

          {/* Results + chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">FI Age</div>
                  <div className="text-2xl font-semibold">{resultsA.fiAge ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Projected FI Year</div>
                  <div className="text-2xl font-semibold">{resultsA.fiYear ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Years to FI</div>
                  <div className="text-2xl font-semibold">
                    {resultsA.yearsToFi === null ? "—" : resultsA.yearsToFi.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">FI Target</div>
                  <div className="text-2xl font-semibold">{formatMoney(resultsA.fiTarget)}</div>
                </div>
              </div>

              {resultsA.fiAge === null ? (
                <p className="mt-3 text-sm text-gray-600">FI is not reached by age 100 under these assumptions.</p>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  Projected to reach FI at age <span className="font-medium">{resultsA.fiAge}</span>.
                </p>
              )}

              {compareEnabled && fiDiffText ? <p className="mt-2 text-sm text-gray-600">{fiDiffText}</p> : null}
            </div>

            {/* Chart */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-medium">Net worth projection</div>
                <div className="text-xs text-gray-500">Annual compounding • No taxes • No inflation (v1)</div>
              </div>

              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        Number(v).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })
                      }
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        if (value === null || value === undefined) return ["—", name];
                        const label = name === "netWorthA" ? "Scenario A" : "Scenario B";
                        return [formatMoney(Number(value)), label];
                      }}
                      labelFormatter={(label) => `Age ${label}`}
                    />

                    <ReferenceLine
                      y={resultsA.fiTarget}
                      strokeDasharray="4 4"
                      label={{ value: "FI Target (A)", position: "insideTopRight" }}
                    />

                    {compareEnabled && resultsB ? (
                      <ReferenceLine
                        y={resultsB.fiTarget}
                        strokeDasharray="4 4"
                        label={{ value: "FI Target (B)", position: "insideTopLeft" }}
                      />
                    ) : null}

                    {/* Scenario lines */}
                    <Line type="monotone" dataKey="netWorthA" dot={false} stroke="#111827" strokeWidth={2} />
                    {compareEnabled ? (
                      <Line type="monotone" dataKey="netWorthB" dot={false} stroke="#6b7280" strokeWidth={2} />
                    ) : null}

                    {/* FI markers */}
                    {fiPointA ? (
                      <ReferenceDot
                        x={fiPointA.age}
                        y={fiPointA.netWorth}
                        r={6}
                        stroke="#111827"
                        strokeWidth={2}
                        label={{ value: "FI (A)", position: "top" }}
                      />
                    ) : null}

                    {compareEnabled && fiPointB ? (
                      <ReferenceDot
                        x={fiPointB.age}
                        y={fiPointB.netWorth}
                        r={6}
                        stroke="#6b7280"
                        strokeWidth={2}
                        label={{ value: "FI (B)", position: "top" }}
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-xs text-gray-500">Tip: Try increasing savings or reducing spending to see how quickly your FI date moves.</div>
            </div>
          </div>
        </section>

        {/* Simple anchors for later */}
        <section id="how" className="mt-14">
          <h2 className="text-xl font-semibold">How it works</h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            FI Clarity calculates your FI target (spending ÷ SWR) and projects your net worth forward annually using
            compounding growth plus annual savings. It’s a transparent baseline model designed for quick scenario thinking.
          </p>
        </section>

        <section id="pricing" className="mt-10">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Free calculator first. Pro ($5/month) will unlock sensitivity sliders, saved scenarios, scenario comparison, and CSV export.
          </p>
        </section>
      </main>
    </div>
  );
}