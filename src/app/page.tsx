"use client";

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
  // Defaults (per spec)
  const [inputs, setInputs] = useState<Inputs>({
    currentAge: 35,
    netWorth: 100000,
    annualSavings: 25000,
    annualSpending: 60000,
    expectedReturnPct: 7,
    swrPct: 4,
  });

  const [draft, setDraft] = useState<Inputs>(inputs);

  const results = useMemo(() => buildProjectionTable(inputs), [inputs]);

  const chartData = useMemo(
    () =>
      results.rows.map((r) => ({
        age: r.age + 1, // show end-of-year age
        year: r.year + 1,
        netWorth: Math.round(r.netWorthEnd),
      })),
    [results.rows]
  );

  const errors: string[] = [];
  if (draft.annualSpending <= 0) errors.push("Annual spending must be greater than 0.");
  if (draft.swrPct <= 0) errors.push("Safe withdrawal rate must be greater than 0.");
  if (draft.currentAge <= 0 || draft.currentAge > 100) errors.push("Current age must be between 1 and 100.");

  const warnings: string[] = [];
  if (draft.swrPct < 2 || draft.swrPct > 6) warnings.push("SWR outside 2–6% is uncommon. Double-check your assumption.");
  if (draft.expectedReturnPct < 0 || draft.expectedReturnPct > 12)
    warnings.push("Return outside 0–12% may be unrealistic for long-term planning.");
  if (draft.annualSavings < 0) warnings.push("Negative annual savings will delay FI.");

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
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
              Log in
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Know your FI date — and what moves it.
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            A transparent financial independence calculator built for serious planners. No hidden assumptions.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Disclaimer: Projections are informational and not financial advice.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <button
                  className="w-full rounded-lg bg-gray-900 text-white py-2.5 hover:bg-gray-800 disabled:bg-gray-300"
                  disabled={errors.length > 0}
                  onClick={() => setInputs(draft)}
                >
                  Update projection
                </button>

                <div className="text-xs text-gray-500">
                  Pro ($5/mo) will later unlock sensitivity sliders, scenario comparison, and CSV export.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">FI Target</div>
                  <div className="text-xl font-semibold">{formatMoney(results.fiTarget)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Years to FI</div>
                  <div className="text-xl font-semibold">
                    {results.yearsToFi === null ? "—" : results.yearsToFi.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Projected FI Year</div>
                  <div className="text-xl font-semibold">{results.fiYear ?? "—"}</div>
                </div>
              </div>

              {results.fiAge === null ? (
                <p className="mt-3 text-sm text-gray-600">FI is not reached by age 100 under these assumptions.</p>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  Projected to reach FI at age <span className="font-medium">{results.fiAge}</span>.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-medium">Net worth projection</div>
                <div className="text-xs text-gray-500">Annual compounding • No taxes • No inflation (v1)</div>
              </div>

              <div className="h-[360px]">
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
                      formatter={(value: any) => [formatMoney(Number(value)), "Net worth"]}
                      labelFormatter={(label) => `Age ${label}`}
                    />
                    <ReferenceLine
                      y={results.fiTarget}
                      strokeDasharray="4 4"
                      label={{ value: "FI Target", position: "insideTopRight" }}
                    />
                    <Line type="monotone" dataKey="netWorth" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mt-14">
          <h2 className="text-xl font-semibold">How it works</h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            FI Clarity calculates your FI target (spending ÷ SWR) and projects your net worth forward annually using
            compounding growth plus annual savings.
          </p>
        </section>

        <section id="pricing" className="mt-10">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Free calculator first. Pro ($5/month) will unlock sensitivity sliders, scenario comparison, and CSV export.
          </p>
        </section>
      </main>
    </div>
  );
}