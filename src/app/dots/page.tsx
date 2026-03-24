'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDOTS, getDotsTier, dotsTierProgression, formatNum } from '@/lib/calculators';

export default function DotsPage() {
  const [bw, setBw] = useState('');
  const [totalLift, setTotalLift] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [result, setResult] = useState<number | null>(null);

  const KG_TO_LBS = 2.20462;

  const calculate = useCallback(() => {
    const bwKg = parseFloat(bw) / (unit === 'lbs' ? KG_TO_LBS : 1);
    const total = parseFloat(totalLift) || 0;
    const totalKg = total / (unit === 'lbs' ? KG_TO_LBS : 1);
    if (!bwKg || !totalKg) return;
    setResult(calculateDOTS(bwKg, totalKg, gender));
  }, [bw, totalLift, gender, unit]);

  const tier = result ? getDotsTier(result) : null;
  const progression = bw ? dotsTierProgression(parseFloat(bw) / (unit === 'lbs' ? KG_TO_LBS : 1), gender) : null;

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Calculator</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>DOTS SCORE</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Official IPF DOTS formula. Compare your total across different bodyweights.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Inputs */}
        <div className="card-glow">
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>INPUTS</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Unit</span>
                <div className="unit-toggle">
                  <button className={unit === 'kg' ? 'active' : ''} onClick={() => setUnit('kg')}>KG</button>
                  <button className={unit === 'lbs' ? 'active' : ''} onClick={() => setUnit('lbs')}>LBS</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Gender</span>
                <div className="unit-toggle">
                  <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>M</button>
                  <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>F</button>
                </div>
              </div>
            </div>

            {[
              { label: 'Bodyweight', val: bw, set: setBw, placeholder: '83' },
              { label: 'Total', val: totalLift, set: setTotalLift, placeholder: '580' },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: '1.25rem' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="ss-input" value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key === 'Enter' && calculate()} placeholder={placeholder} min="1" step="0.5" />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>{unit}</span>
                </div>
              </div>
            ))}

            <div className="hover-btn-wrap" style={{ display: 'block' }}>
              <button className="hover-btn" style={{ width: '100%' }} onClick={calculate}>CALCULATE DOTS</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Score big */}
          <div className="card-glow">
            <div className="card-inner" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>DOTS SCORE</div>
              <AnimatePresence mode="wait">
                <motion.div key={result ?? 'empty'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(64px,10vw,104px)', color: tier?.color || 'var(--red)', lineHeight: 1 }}>
                  {result ? formatNum(result, 1) : '—'}
                </motion.div>
              </AnimatePresence>
              {tier && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.color, padding: '4px 18px', border: `1.5px solid ${tier.color}`, borderRadius: 6 }}>
                    {tier.label}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tier progression */}
          {progression && (
            <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>TIER TARGETS</h3>
                <table className="ss-table">
                  <thead><tr><th>Tier</th><th>DOTS</th><th style={{ textAlign: 'right' }}>Required Total</th></tr></thead>
                  <tbody>
                    {progression.map(p => {
                      const t = getDotsTier(p.dots);
                      const achieved = result !== null && result >= p.dots;
                      return (
                        <tr key={p.label}>
                          <td><span style={{ color: achieved ? t.color : 'var(--text-3)', fontWeight: achieved ? 700 : 400 }}>{p.label}</span></td>
                          <td style={{ color: 'var(--text-3)' }}>{p.dots}</td>
                          <td style={{ textAlign: 'right', color: achieved ? 'var(--teal)' : 'var(--text)' }}>
                            {formatNum(unit === 'lbs' ? p.requiredTotal * 2.20462 : p.requiredTotal, 1)} {unit}
                            {achieved && ' ✓'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="glass" style={{ padding: '1.25rem 1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7 }}>
              DOTS = Total × 500 / (a·BW⁴ − b·BW³ + c·BW² − d·BW + e). Coefficients differ by gender. Reference: IPF DOTS Formula Document.
            </p>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 767px) { main > div:nth-child(2) { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
