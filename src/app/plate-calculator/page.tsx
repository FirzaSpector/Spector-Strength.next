'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePlates, KG_PLATES, LBS_PLATES, formatNum } from '@/lib/calculators';
import PlateVisual from '@/components/PlateVisual';

export default function PlateCalculatorPage() {
  const [target, setTarget] = useState('140');
  const [barWeight, setBarWeight] = useState('20');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [result, setResult] = useState<ReturnType<typeof calculatePlates> | null>(null);

  const calculate = useCallback(() => {
    const t = parseFloat(target);
    const bw = parseFloat(barWeight);
    if (!t || t < bw) {
      setResult(null);
      return;
    }
    setResult(calculatePlates(t, bw, unit));
  }, [target, barWeight, unit]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const quickWeights = unit === 'kg' 
    ? [60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300]
    : [135, 185, 225, 275, 315, 365, 405, 455, 495, 545, 585, 635, 675];

  const plates = unit === 'kg' ? KG_PLATES : LBS_PLATES;

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Calculator</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>PLATE CALCULATOR</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Know exactly which plates go on the bar — every time.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glow">
            <div className="card-inner">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>LOAD</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Unit</span>
                <div className="unit-toggle">
                  <button className={unit === 'kg' ? 'active' : ''} onClick={() => { setUnit('kg'); setBarWeight('20'); }}>KG</button>
                  <button className={unit === 'lbs' ? 'active' : ''} onClick={() => { setUnit('lbs'); setBarWeight('45'); }}>LBS</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Target Weight</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" className="ss-input" value={target} onChange={e => setTarget(e.target.value)} placeholder="140" min="1" step="0.5" />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>{unit}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Bar Weight</label>
                  <select className="ss-select" value={barWeight} onChange={e => setBarWeight(e.target.value)}>
                    {unit === 'kg' ? (
                      <>
                        <option value="20">20 kg (Olympic)</option>
                        <option value="15">15 kg (Women's Olympic)</option>
                        <option value="10">10 kg (Training)</option>
                      </>
                    ) : (
                      <>
                        <option value="45">45 lbs (Olympic)</option>
                        <option value="35">35 lbs (Women's Olympic)</option>
                        <option value="25">25 lbs (Training)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Quick load */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Quick Load:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {quickWeights.map(w => (
                    <button 
                      key={w} 
                      onClick={() => setTarget(w.toString())}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hover-btn-wrap" style={{ display: 'block' }}>
                <button className="hover-btn" style={{ width: '100%' }} onClick={calculate}>CALCULATE PLATES</button>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="card-inner" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '1rem' }}>IPF PLATE COLORS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plates.map(p => (
                  <div key={p.weight} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: p.color, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: p.textColor, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                      {p.label}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{p.weight} {unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Visual bar card */}
          <div className="card-glow" style={{ overflow: 'hidden' }}>
            <div className="card-inner" style={{ padding: 0 }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', color: 'var(--text-2)' }}>BAR VISUALIZATION</h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={result?.loaded ?? 'empty'}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: result && Math.abs(result.remainder) < 0.01 ? 'var(--teal)' : 'var(--red)', letterSpacing: '0.04em' }}
                  >
                    {result ? `${formatNum(result.loaded, 1)} ${unit}` : '—'}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div style={{ padding: '1rem', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {result ? (
                  <PlateVisual plates={result.plates} unit={unit} />
                ) : (
                  <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Enter a target weight to load the bar</div>
                )}
              </div>
              {result && result.remainder > 0.01 && (
                <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(220,38,38,0.06)', borderTop: '1px solid rgba(220,38,38,0.2)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>
                  ⚠ Exact weight not achievable. Closest: {formatNum(result.loaded, 2)} {unit}. Remainder: {formatNum(result.remainder, 2)} {unit}
                </div>
              )}
            </div>
          </div>

          {/* Plate details */}
          {result && (
            <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>PLATES PER SIDE</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {result.plates.map(({ plate, count }, idx) => (
                    <motion.div 
                      key={plate.weight}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        background: plate.color,
                        color: plate.textColor,
                        padding: '12px 16px',
                        borderRadius: 8,
                        minWidth: 80,
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, lineHeight: 1 }}>{plate.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.8, marginTop: 4 }}>× {count}</div>
                    </motion.div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                  {result.plates.length > 0 ? (
                    `${result.plates.reduce((a, b) => a + b.count, 0)} plates per side · Bar: ${barWeight} ${unit} · Total: ${formatNum(result.loaded, 2)} ${unit}`
                  ) : (
                    'Bar only — no plates needed'
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading order */}
          {result && result.plates.length > 0 && (
            <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '0.5rem', color: 'var(--text-2)' }}>LOADING ORDER</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: '1rem' }}>Load outer plates first. Work inward.</p>
                <table className="ss-table">
                  <thead><tr><th>Order</th><th>Plate</th><th>Qty/Side</th><th style={{ textAlign: 'right' }}>Running Total</th></tr></thead>
                  <tbody>
                    {(() => {
                      let running = parseFloat(barWeight);
                      return result.plates.map(({ plate, count }, i) => {
                        running += plate.weight * count * 2;
                        return (
                          <tr key={plate.weight}>
                            <td style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 14, height: 14, background: plate.color, borderRadius: 2 }} />
                                {plate.weight} {unit}
                              </div>
                            </td>
                            <td>×{count}</td>
                            <td style={{ textAlign: 'right', color: i === result.plates.length -1 ? 'var(--teal)' : 'var(--text-2)', fontWeight: i === result.plates.length - 1 ? 700 : 400 }}>
                              {formatNum(running, 2)} {unit}
                            </td>
                          </tr>
                        );
                      });
                    })()}
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
