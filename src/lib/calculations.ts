export type Inputs = {
  currentAge: number; // years
  netWorth: number; // $
  annualSavings: number; // $/yr
  annualSpending: number; // $/yr
  expectedReturnPct: number; // e.g. 7 for 7%
  swrPct: number; // e.g. 4 for 4%
};

export type ProjectionRow = {
  age: number;
  year: number;
  netWorthStart: number;
  netWorthEnd: number;
  annualSavings: number;
  returnRate: number; // decimal
  fiTarget: number;
  isFiReached: boolean;
};

export function calculateFiTarget(annualSpending: number, swrPct: number): number {
  const swr = swrPct / 100;
  if (annualSpending <= 0 || swr <= 0) return Number.POSITIVE_INFINITY;
  return annualSpending / swr;
}

export function projectNetWorthOneYear(netWorth: number, annualSavings: number, returnRate: number): number {
  // Order: grow existing NW, then add savings (per spec)
  return netWorth * (1 + returnRate) + annualSavings;
}

export function buildProjectionTable(inputs: Inputs): {
  fiTarget: number;
  rows: ProjectionRow[];
  fiAge: number | null;
  fiYear: number | null;
  yearsToFi: number | null;
} {
  const currentYear = new Date().getFullYear();
  const r = inputs.expectedReturnPct / 100;
  const fiTarget = calculateFiTarget(inputs.annualSpending, inputs.swrPct);

  const startAge = Math.floor(inputs.currentAge);
  const maxAge = 100;

  let nw = inputs.netWorth;

  const rows: ProjectionRow[] = [];
  let fiAge: number | null = null;
  let fiYear: number | null = null;

  for (let age = startAge; age <= maxAge; age++) {
    const year = currentYear + (age - startAge);
    const netWorthStart = nw;
    const netWorthEnd = projectNetWorthOneYear(nw, inputs.annualSavings, r);

    const isFiReached = fiAge === null && netWorthEnd >= fiTarget;

    rows.push({
      age,
      year,
      netWorthStart,
      netWorthEnd,
      annualSavings: inputs.annualSavings,
      returnRate: r,
      fiTarget,
      isFiReached,
    });

    if (isFiReached) {
      // reached at end of this year → next age/year is when FI is achieved
      fiAge = age + 1;
      fiYear = year + 1;
    }

    nw = netWorthEnd;
  }

  const yearsToFi = fiAge === null ? null : fiAge - inputs.currentAge;

  return { fiTarget, rows, fiAge, fiYear, yearsToFi };
}