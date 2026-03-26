// ─── 1RM FORMULAS ───────────────────────────────────────────────────────────

export function epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function brzycki(weight: number, reps: number): number | null {
  if (reps === 1) return weight;
  if (reps >= 37) return null;
  return weight * (36 / (37 - reps));
}

export function lander(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return (100 * weight) / (101.3 - 2.67123 * reps);
}

export function lombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.10);
}

export function oconner(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + 0.025 * reps);
}

export interface OneRMResults {
  epley: number;
  brzycki: number | null;
  lander: number;
  lombardi: number;
  oconner: number;
  average: number;
}

export function calculate1RM(weight: number, reps: number): OneRMResults {
  const results = {
    epley: epley(weight, reps),
    brzycki: brzycki(weight, reps),
    lander: lander(weight, reps),
    lombardi: lombardi(weight, reps),
    oconner: oconner(weight, reps),
    average: 0,
  };
  const valid = Object.values(results).filter((v): v is number => v !== null && v !== 0);
  results.average = valid.reduce((a, b) => a + b, 0) / valid.length;
  return results;
}

export function percentageChart(oneRM: number): { pct: number; weight: number }[] {
  return [50, 60, 70, 75, 80, 85, 90, 95, 100].map(pct => ({
    pct,
    weight: (oneRM * pct) / 100,
  }));
}

// ─── DOTS ────────────────────────────────────────────────────────────────────

const DOTS_COEFF = {
  male: { a: -0.000001093, b: 0.0007391293, c: -0.1918759221, d: 24.0900756, e: -307.75076 },
  female: { a: -0.0000010706, b: 0.0005158568, c: -0.1126655495, d: 13.6175032, e: -57.96288 },
};

export function calculateDOTS(bodyweight: number, total: number, gender: 'male' | 'female'): number | null {
  const c = DOTS_COEFF[gender];
  const bw = bodyweight;
  const denom =
    c.a * Math.pow(bw, 4) +
    c.b * Math.pow(bw, 3) +
    c.c * Math.pow(bw, 2) +
    c.d * bw +
    c.e;
  if (denom === 0) return null;
  return total * (500 / denom);
}

export interface DotsTier {
  tier: string;
  label: string;
  color: string;
}

export function getDotsTier(dots: number): DotsTier {
  if (dots >= 400) return { tier: 'elite', label: 'Elite', color: '#ffab00' };
  if (dots >= 350) return { tier: 'advanced', label: 'Advanced', color: '#00bfa5' };
  if (dots >= 300) return { tier: 'intermediate', label: 'Intermediate', color: '#4fc3f7' };
  return { tier: 'novice', label: 'Novice', color: '#78716c' };
}

export function dotsTierProgression(bodyweight: number, gender: 'male' | 'female') {
  const targets = [
    { label: 'Intermediate', dots: 300 },
    { label: 'Advanced', dots: 350 },
    { label: 'Elite', dots: 400 },
  ];
  return targets.map(t => {
    const c = DOTS_COEFF[gender];
    const bw = bodyweight;
    const denom =
      c.a * Math.pow(bw, 4) +
      c.b * Math.pow(bw, 3) +
      c.c * Math.pow(bw, 2) +
      c.d * bw +
      c.e;
    const requiredTotal = t.dots * (denom / 500);
    return { label: t.label, requiredTotal, dots: t.dots };
  });
}

// ─── MEET PLANNER ────────────────────────────────────────────────────────────

export function roundToNearest(value: number, multiple = 0.5): number {
  return Math.round(value / multiple) * multiple;
}

export interface Attempts {
  opener: number;
  second: number;
  third: number;
}

export function calculateAttempts(
  max: number,
  opener_pct = 0.875,
  second_pct = 0.950,
  third_pct = 1.000,
  unit: 'kg' | 'lbs' = 'kg'
): Attempts {
  const multiple = unit === 'kg' ? 0.5 : 5;
  return {
    opener: roundToNearest(max * opener_pct, multiple),
    second: roundToNearest(max * second_pct, multiple),
    third: roundToNearest(max * third_pct, multiple),
  };
}

export interface WarmupSet {
  weight: number;
  sets: number;
  reps: number;
  label: string;
  pct: number;
}

export function generateWarmupRamp(opener: number, unit: 'kg' | 'lbs' = 'kg'): WarmupSet[] {
  const barWeight = unit === 'kg' ? 20 : 45;
  const multiple = unit === 'kg' ? 2.5 : 5;
  const stages = [
    { pct: 0, sets: 2, reps: 10, label: 'Bar Warmup' },
    { pct: 0.40, sets: 2, reps: 5, label: '40%' },
    { pct: 0.60, sets: 2, reps: 3, label: '60%' },
    { pct: 0.75, sets: 1, reps: 2, label: '75%' },
    { pct: 0.85, sets: 1, reps: 1, label: '85%' },
    { pct: 1.00, sets: 1, reps: 1, label: 'Opener (Attempt 1)' },
  ];
  return stages.map(s => ({
    weight: s.pct === 0 ? barWeight : roundToNearest(opener * s.pct, multiple),
    sets: s.sets,
    reps: s.reps,
    label: s.label,
    pct: Math.round(s.pct * 100),
  }));
}

// ─── PLATE CALCULATOR ────────────────────────────────────────────────────────

export interface PlateDefinition {
  weight: number;
  color: string;
  label: string;
  textColor: string;
}

export const KG_PLATES: PlateDefinition[] = [
  { weight: 25, color: '#e90b0b', label: '25', textColor: '#fff' },
  { weight: 20, color: '#030ced', label: '20', textColor: '#fff' },
  { weight: 15, color: '#fff32d', label: '15', textColor: '#fff' },
  { weight: 10, color: '#16a34a', label: '10', textColor: '#fff' },
  { weight: 5, color: '#f5f5f5', label: '5', textColor: '#000' },
  { weight: 2.5, color: '#374151', label: '2.5', textColor: '#fff' },
  { weight: 1.25, color: '#c0c0c0', label: '1.25', textColor: '#000' },
];

export const LBS_PLATES: PlateDefinition[] = [
  { weight: 45, color: '#dc2626', label: '45', textColor: '#fff' },
  { weight: 35, color: '#7c3aed', label: '35', textColor: '#fff' },
  { weight: 25, color: '#1d4ed8', label: '25', textColor: '#fff' },
  { weight: 10, color: '#16a34a', label: '10', textColor: '#fff' },
  { weight: 5, color: '#f5f5f5', label: '5', textColor: '#000' },
  { weight: 2.5, color: '#374151', label: '2.5', textColor: '#fff' },
  { weight: 1.25, color: '#c0c0c0', label: '1.25', textColor: '#000' },
];

export interface PlateResult {
  plates: { plate: PlateDefinition; count: number }[];
  loaded: number;
  remainder: number;
}

export function calculatePlates(
  targetTotal: number,
  barWeight: number,
  unit: 'kg' | 'lbs' = 'kg'
): PlateResult {
  const plateSet = unit === 'kg' ? KG_PLATES : LBS_PLATES;
  let remaining = (targetTotal - barWeight) / 2;
  const platesUsed: { plate: PlateDefinition; count: number }[] = [];
  let totalLoaded = barWeight;

  for (const plate of plateSet) {
    const maxPossible = Math.floor(remaining / plate.weight);
    const count = Math.min(maxPossible, 10);
    if (count > 0) {
      platesUsed.push({ plate, count });
      remaining -= count * plate.weight;
      totalLoaded += count * plate.weight * 2;
    }
  }

  return { plates: platesUsed, loaded: totalLoaded, remainder: remaining * 2 };
}

// ─── UNIT CONVERSION ─────────────────────────────────────────────────────────

export const KG_TO_LBS = 2.20462;
export const LBS_TO_KG = 1 / KG_TO_LBS;

export function kgToLbs(kg: number): number { return kg * KG_TO_LBS; }
export function lbsToKg(lbs: number): number { return lbs * LBS_TO_KG; }
export function formatNum(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return parseFloat(n.toFixed(decimals)).toString();
}
