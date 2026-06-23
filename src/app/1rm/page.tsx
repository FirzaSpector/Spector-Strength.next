'use client';

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculate1RM, percentageChart, formatNum } from '@/lib/calculators';
import {
  isAuthenticated,
  apiCreateLift,
  apiGetLifts,
  type LiftLogResponse,
  type LiftLogCreate,
} from '@/lib/api';
import { CheckCircle, AlertCircle, LogIn, Dumbbell } from 'lucide-react';

const formulaKeys = ['epley', 'brzycki', 'lander', 'lombardi', 'oconner'] as const;
const formulaLabels: Record<string, string> = {
  epley: 'Epley', brzycki: 'Brzycki', lander: 'Lander', lombardi: 'Lombardi', oconner: "O'Conner",
};

const LIFT_TYPES = ['squat', 'bench', 'deadlift'] as const;
type LiftType = typeof LIFT_TYPES[number];

type LogStatus = 'idle' | 'saving' | 'success' | 'error';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OneRMPage() {
  // ── Calculator state ────────────────────────────────────────────────────
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

  // ── Lift log state (backend) ────────────────────────────────────────────
  const [loggedIn] = useState(() => isAuthenticated());
  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [logWeight, setLogWeight] = useState('');
  const [logReps, setLogReps] = useState('');
  const [logRpe, setLogRpe] = useState('');
  const [logStatus, setLogStatus] = useState<LogStatus>('idle');
  const [logError, setLogError] = useState<string | null>(null);
  const [liftHistory, setLiftHistory] = useState<LiftLogResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // fetch history on mount if authenticated
  useEffect(() => {
    if (!loggedIn) return;
    setHistoryLoading(true);
    apiGetLifts()
      .then(setLiftHistory)
      .catch(() => { /* silently ignore */ })
      .finally(() => setHistoryLoading(false));
  }, [loggedIn]);

  async function handleLogLift(e: FormEvent) {
    e.preventDefault();
    setLogError(null);
    const w = parseFloat(logWeight);
    const r = parseInt(logReps);
    const rpe = logRpe ? parseFloat(logRpe) : null;

    if (!w || w <= 0) { setLogError('Weight must be greater than 0.'); return; }
    if (!r || r < 1) { setLogError('Reps must be at least 1.'); return; }
    if (rpe !== null && (rpe < 1 || rpe > 10)) { setLogError('RPE must be between 1 and 10.'); return; }

    setLogStatus('saving');
    try {
      const payload: LiftLogCreate = { lift_type: liftType, weight: w, reps: r, rpe };
      const newLift = await apiCreateLift(payload);
      setLiftHistory(prev => [newLift, ...prev]);
      setLogWeight('');
      setLogReps('');
      setLogRpe('');
      setLogStatus('success');
      setTimeout(() => setLogStatus('idle'), 3000);
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Failed to log lift.');
      setLogStatus('error');
    }
  }

  const liftColorMap: Record<string, string> = {
    squat: 'var(--red)',
    bench: 'var(--teal)',
    deadlift: '#ffab00',
  };

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Calculator</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>1RM CALCULATOR</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Five proven formulas to estimate your one-rep max. Log lifts to track your progress over time.</p>
        </div>
      </div>

      {/* ── Calculator section ── */}
      <div className="orm-calc-grid">
        {/* Inputs */}
        <div className="card-glow">
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>INPUTS</h2>
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

          <div className="card-glow">
            <div className="card-inner">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>FORMULA BREAKDOWN</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {formulaKeys.map(key => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-2)' }}>{formulaLabels[key]}</div>
                    <AnimatePresence mode="wait">
                      <motion.div key={results ? (results[key] ?? 'null') : 'empty'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text)' }}>
                        {results ? (results[key] !== null ? `${formatNum(results[key] as number, 1)} ${unit}` : 'N/A') : '—'}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                          <div style={{ width: `${pct}%`, maxWidth: 120, height: 4, background: `hsl(${pct * 1.2},70%,50%)`, borderRadius: 2, minWidth: 8 }} />
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

      {/* ── Lift Tracking section ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1rem, 5vw, 2rem) 5rem' }}>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '1.5rem' }}>
          <div className="section-label">Lift Tracker</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px,5vw,48px)', letterSpacing: '-0.01em', lineHeight: 0.95 }}>LOG A LIFT</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, marginTop: '0.5rem' }}>
            {loggedIn ? 'Record your sets. The backend calculates e1RM via Brzycki and saves to your history.' : 'Sign in to save lift logs and track your progress over time.'}
          </p>
        </div>

        {!loggedIn ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass"
            style={{ padding: '2.5rem', textAlign: 'center' }}
          >
            <Dumbbell size={36} style={{ color: 'var(--text-3)', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-2)', marginBottom: '1.5rem' }}>
              Create an account to log lifts and track your e1RM over time.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="hover-btn-wrap">
                <a href="/login" className="hover-btn" style={{ gap: 8 }}><LogIn size={16} />SIGN IN</a>
              </div>
              <div className="hover-btn-wrap">
                <a href="/register" className="hover-btn">CREATE ACCOUNT</a>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="orm-log-grid">
            {/* Log form */}
            <div className="card-glow">
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', marginBottom: '1.5rem', color: 'var(--text-2)' }}>NEW ENTRY</h3>
                <form onSubmit={handleLogLift} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Lift type */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Lift</label>
                      <div className="unit-toggle" style={{ width: '100%', justifyContent: 'stretch' }}>
                        {LIFT_TYPES.map(lt => (
                          <button
                            key={lt}
                            type="button"
                            className={liftType === lt ? 'active' : ''}
                            onClick={() => setLiftType(lt)}
                            style={{ flex: 1, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                          >
                            {lt === 'deadlift' ? 'DL' : lt.slice(0, 3).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label htmlFor="log-weight" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Weight (kg)</label>
                      <div style={{ position: 'relative' }}>
                        <input id="log-weight" type="number" className="ss-input" placeholder="140" min="0.1" step="0.5" value={logWeight} onChange={e => setLogWeight(e.target.value)} />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
                      </div>
                    </div>

                    {/* Reps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label htmlFor="log-reps" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Reps</label>
                      <input id="log-reps" type="number" className="ss-input" placeholder="3" min="1" step="1" value={logReps} onChange={e => setLogReps(e.target.value)} />
                    </div>

                    {/* RPE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label htmlFor="log-rpe" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>RPE <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional, 1–10)</span></label>
                      <input id="log-rpe" type="number" className="ss-input" placeholder="8.5" min="1" max="10" step="0.5" value={logRpe} onChange={e => setLogRpe(e.target.value)} />
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                      {logError && (
                        <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff6b6b' }}
                          role="alert"
                        >
                          <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                          {logError}
                        </motion.div>
                      )}
                      {logStatus === 'success' && (
                        <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}
                          role="status"
                        >
                          <CheckCircle size={14} style={{ flexShrink: 0 }} />
                          Lift logged!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="hover-btn-wrap" style={{ display: 'block' }}>
                      <button type="submit" className="hover-btn" style={{ width: '100%' }} disabled={logStatus === 'saving'} aria-busy={logStatus === 'saving'}>
                        {logStatus === 'saving' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            LOGGING…
                          </span>
                        ) : 'LOG LIFT'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* History */}
            <div className="card-glow">
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-2)' }}>LIFT HISTORY</h3>
                {historyLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 0', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Loading…
                  </div>
                ) : liftHistory.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', padding: '1rem 0' }}>No lifts logged yet. Record your first set!</p>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="orm-history-table-wrap">
                      <table className="ss-table">
                        <thead>
                          <tr>
                            <th>Date</th><th>Lift</th><th>Weight</th><th>Reps</th><th>RPE</th>
                            <th style={{ textAlign: 'right', color: 'var(--teal)' }}>e1RM</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liftHistory.map(lift => (
                            <motion.tr key={lift.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <td style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{formatDate(lift.created_at)}</td>
                              <td style={{ color: liftColorMap[lift.lift_type] ?? 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>{lift.lift_type}</td>
                              <td>{lift.weight} kg</td>
                              <td>{lift.reps}</td>
                              <td style={{ color: 'var(--text-3)' }}>{lift.rpe != null ? lift.rpe : '—'}</td>
                              <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNum(lift.e1rm, 1)} kg</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile card list */}
                    <div className="orm-lift-cards">
                      {liftHistory.map(lift => (
                        <motion.div key={lift.id} className="orm-lift-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: liftColorMap[lift.lift_type] ?? 'var(--text-2)' }}>{lift.lift_type}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{formatDate(lift.created_at)}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 0.75rem' }}>
                            {[
                              { label: 'Weight', value: `${lift.weight} kg` },
                              { label: 'Reps', value: String(lift.reps) },
                              { label: 'RPE', value: lift.rpe != null ? String(lift.rpe) : '—' },
                              { label: 'e1RM', value: `${formatNum(lift.e1rm, 1)} kg`, highlight: true },
                            ].map(({ label, value, highlight }) => (
                              <div key={label}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{label}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: highlight ? 'var(--teal)' : 'var(--text)', fontWeight: highlight ? 700 : 400 }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Calculator 2-col grid ── */
        .orm-calc-grid {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem clamp(1rem, 5vw, 2rem) 2rem;
          display: grid;
          grid-template-columns: minmax(280px, 380px) 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── Log-a-lift 2-col grid ── */
        .orm-log-grid {
          display: grid;
          grid-template-columns: minmax(280px, 380px) 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── History: desktop table, hidden cards ── */
        .orm-history-table-wrap { overflow-x: auto; }
        .orm-lift-cards { display: none; }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .orm-calc-grid,
          .orm-log-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          /* Hide table, show cards */
          .orm-history-table-wrap { display: none; }
          .orm-lift-cards {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
          }
          .orm-lift-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0.85rem 1rem;
          }
        }
      `}</style>
    </main>
  );
}
