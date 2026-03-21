'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculate1RM, percentageChart, formatNum } from '@/lib/calculators';

const formulaKeys = ['epley', 'brzycki', 'lander', 'lombardi', 'oconner'] as const;
const formulaLabels: Record<string, string> = {
  epley: 'Epley', brzycki: 'Brzycki', lander: 'Lander', lombardi: 'Lombardi', oconner: "O'Conner",
};

export default function OneRMPage() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [results, setResults] = useState<ReturnType<typeof calculate1RM> | null>(null);

  const calculate = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r || r < 1) return;
    setResults(calculate1RM(w, r));
  }, [weight, reps]);

  const pctChart = results ? percentageChart(results.average) : null;

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Calculator</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(44px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>1RM CALCULATOR</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Five proven formulas to estimate your one-rep max from any rep count.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Inputs */}
        <div className="card-glow">
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>INPUTS</h2>

            {/* Unit toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Unit</span>
              <div className="unit-toggle">
                <button className={unit === 'kg' ? 'active' : ''} onClick={() => setUnit('kg')}>KG</button>
                <button className={unit === 'lbs' ? 'active' : ''} onClick={() => setUnit('lbs')}>LBS</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Weight Lifted</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="ss-input" value={weight} onChange={e => setWeight(e.target.value)} onKeyDown={e => e.key === 'Enter' && calculate()} placeholder="100" min="1" step="0.5" />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>{unit}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Reps Performed</label>
                <input type="number" className="ss-input" value={reps} onChange={e => setReps(e.target.value)} onKeyDown={e => e.key === 'Enter' && calculate()} placeholder="5" min="1" max="30" />
              </div>
            </div>

            <div className="hover-btn-wrap" style={{ display: 'block' }}>
              <button className="hover-btn" style={{ width: '100%' }} onClick={calculate}>CALCULATE 1RM</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Average */}
          <div className="card-glow">
            <div className="card-inner" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>AVERAGE ESTIMATE</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={results?.average ?? 'empty'}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(56px,8vw,88px)', color: 'var(--red)', lineHeight: 1 }}
                >
                  {results ? `${formatNum(results.average, 1)} ${unit}` : '—'}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Formula results */}
          <div className="card-glow">
            <div className="card-inner">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>FORMULA BREAKDOWN</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {formulaKeys.map(key => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-2)' }}>{formulaLabels[key]}</div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div key={results ? results[key] ?? 'null' : 'empty'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text)' }}>
                        {results ? (results[key] !== null ? `${formatNum(results[key] as number, 1)} ${unit}` : 'N/A') : '—'}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Percentage chart */}
          {pctChart && (
            <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>PERCENTAGE CHART</h3>
                <table className="ss-table">
                  <thead>
                    <tr><th>%</th><th>Weight</th><th style={{ textAlign: 'right' }}>Bar</th></tr>
                  </thead>
                  <tbody>
                    {pctChart.map(({ pct, weight: w }) => (
                      <tr key={pct}>
                        <td style={{ color: 'var(--text-3)' }}>{pct}%</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: `${pct}%`, maxWidth: 120, height: 4, background: `hsl(${pct * 1.2},70%,50%)`, borderRadius: 2, minWidth: 8 }} />
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', color: pct === 100 ? 'var(--teal)' : 'var(--text)', fontWeight: pct === 100 ? 700 : 400 }}>
                          {formatNum(w, 1)} {unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 767px) { main > div:nth-child(2) { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
