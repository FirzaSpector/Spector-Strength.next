'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAttempts, generateWarmupRamp, calculatePlates, formatNum } from '@/lib/calculators';

const lifts = ['SQUAT', 'BENCH', 'DEADLIFT'] as const;

export default function MeetPlannerPage() {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [maxes, setMaxes] = useState({ SQUAT: '', BENCH: '', DEADLIFT: '' });
  const [results, setResults] = useState<Record<string, ReturnType<typeof calculateAttempts>> | null>(null);
  const [warmupLift, setWarmupLift] = useState<typeof lifts[number]>('SQUAT');

  const calculate = useCallback(() => {
    const r: Record<string, ReturnType<typeof calculateAttempts>> = {};
    lifts.forEach(l => {
      const v = parseFloat(maxes[l]);
      if (v) r[l] = calculateAttempts(v, 0.875, 0.950, 1.0, unit);
    });
    setResults(Object.keys(r).length > 0 ? r : null);
  }, [maxes, unit]);

  const warmupMax = parseFloat(maxes[warmupLift]);
  const warmupSets = warmupMax && results?.[warmupLift] ? generateWarmupRamp(results[warmupLift].opener, unit) : null;

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Planner</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(44px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>MEET PLANNER</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Auto-generate your three attempts and a full warmup ramp for competition day.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Inputs */}
        <div className="card-glow">
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>COMPETITION MAXES</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Unit</span>
              <div className="unit-toggle">
                <button className={unit === 'kg' ? 'active' : ''} onClick={() => setUnit('kg')}>KG</button>
                <button className={unit === 'lbs' ? 'active' : ''} onClick={() => setUnit('lbs')}>LBS</button>
              </div>
            </div>
            {lifts.map(l => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: '1.25rem' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{l}</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="ss-input" value={maxes[l]} onChange={e => setMaxes(p => ({ ...p, [l]: e.target.value }))} placeholder={l === 'BENCH' ? '120' : '180'} min="1" step="0.5" />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>{unit}</span>
                </div>
              </div>
            ))}
            <div className="hover-btn-wrap" style={{ display: 'block' }}>
              <button className="hover-btn" style={{ width: '100%' }} onClick={calculate}>GENERATE ATTEMPTS</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Attempts grid */}
          <AnimatePresence>
            {results && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card-glow">
                  <div className="card-inner">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>ATTEMPTS</h3>
                    <table className="ss-table">
                      <thead><tr><th>Lift</th><th>Opener (~87.5%)</th><th>2nd (~95%)</th><th style={{ textAlign: 'right' }}>3rd (Max)</th></tr></thead>
                      <tbody>
                        {lifts.filter(l => results[l]).map(l => (
                          <tr key={l}>
                            <td style={{ color: 'var(--red)', fontWeight: 700 }}>{l}</td>
                            <td>{results[l].opener} {unit}</td>
                            <td>{results[l].second} {unit}</td>
                            <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 700 }}>{results[l].third} {unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warmup ramp */}
          {results && (
            <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', color: 'var(--text-2)' }}>WARMUP RAMP</h3>
                  <div className="unit-toggle">
                    {lifts.filter(l => results[l]).map(l => (
                      <button key={l} className={warmupLift === l ? 'active' : ''} onClick={() => setWarmupLift(l)} style={{ fontSize: 11 }}>{l.slice(0, 3)}</button>
                    ))}
                  </div>
                </div>
                {warmupSets ? (
                  <table className="ss-table">
                    <thead><tr><th>Set</th><th>%</th><th>Weight</th><th>Sets × Reps</th><th style={{ textAlign: 'right' }}>Plates/side</th></tr></thead>
                    <tbody>
                      {warmupSets.map((s, i) => {
                        const plResult = calculatePlates(s.weight, unit === 'kg' ? 20 : 45, unit);
                        const plateStr = plResult.plates.map(p => `${p.plate.label}×${p.count}`).join(', ') || 'Bar only';
                        return (
                          <tr key={i}>
                            <td style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                            <td style={{ color: 'var(--text-3)' }}>{s.pct > 0 ? `${s.pct}%` : '—'}</td>
                            <td>{s.weight} {unit}</td>
                            <td style={{ color: 'var(--text-3)' }}>{s.sets}×{s.reps}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{plateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>Enter a max to generate warmups.</p>
                )}
              </div>
            </motion.div>
          )}

          {!results && (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>Enter at least one lift max and click Generate Attempts.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 767px) { main > div:nth-child(2) { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
