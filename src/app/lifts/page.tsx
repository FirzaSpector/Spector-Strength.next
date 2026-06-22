'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, CheckCircle, AlertCircle } from 'lucide-react';
import { isAuthenticated, apiCreateLift, apiGetLifts, type LiftLogResponse, type LiftLogCreate } from '@/lib/api';
import { formatNum } from '@/lib/calculators';

const LIFT_TYPES = ['squat', 'bench', 'deadlift'] as const;
type LiftType = typeof LIFT_TYPES[number];
type LogStatus = 'idle' | 'saving' | 'success' | 'error';

const LIFT_COLOR: Record<string, string> = { squat: 'var(--red)', bench: 'var(--teal)', deadlift: '#ffab00' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LiftsPage() {
  const router = useRouter();

  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [logStatus, setLogStatus] = useState<LogStatus>('idle');
  const [logError, setLogError] = useState<string | null>(null);

  const [history, setHistory] = useState<LiftLogResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filter, setFilter] = useState<LiftType | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    apiGetLifts()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLogError(null);
    const w = parseFloat(weight);
    const r = parseInt(reps);
    const rpeVal = rpe ? parseFloat(rpe) : null;
    if (!w || w <= 0) { setLogError('Weight must be greater than 0.'); return; }
    if (!r || r < 1)  { setLogError('Reps must be at least 1.'); return; }
    if (rpeVal !== null && (rpeVal < 1 || rpeVal > 10)) { setLogError('RPE must be between 1 and 10.'); return; }

    setLogStatus('saving');
    try {
      const payload: LiftLogCreate = { lift_type: liftType, weight: w, reps: r, rpe: rpeVal };
      const newLift = await apiCreateLift(payload);
      setHistory(prev => [newLift, ...prev]);
      setWeight(''); setReps(''); setRpe('');
      setLogStatus('success');
      setTimeout(() => setLogStatus('idle'), 3000);
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Failed to log lift.');
      setLogStatus('error');
    }
  }

  const filtered = filter === 'all' ? history : history.filter(l => l.lift_type === filter);

  // per-lift PR (highest e1rm)
  const prs: Record<string, number> = {};
  history.forEach(l => {
    if (!prs[l.lift_type] || l.e1rm > prs[l.lift_type]) prs[l.lift_type] = l.e1rm;
  });

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Tracker</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>
            LIFT LOG
          </h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>
            Log every set. Track your estimated 1RM progress across squat, bench, and deadlift.
          </p>
        </div>
      </div>

      {/* PR summary bar */}
      {Object.keys(prs).length > 0 && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1.25rem clamp(1.25rem, 5vw, 2.5rem)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {LIFT_TYPES.filter(lt => prs[lt]).map(lt => (
              <div key={lt}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 3 }}>Best {lt} e1RM</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: LIFT_COLOR[lt], lineHeight: 1 }}>{formatNum(prs[lt], 1)} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-3)' }}>kg</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Log form */}
        <div className="card-glow">
          <div className="card-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(229,57,53,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,57,53,0.25)', flexShrink: 0 }}>
                <Dumbbell size={19} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)' }}>LOG A LIFT</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Lift type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Lift</label>
                  <div className="unit-toggle" style={{ width: '100%' }}>
                    {LIFT_TYPES.map(lt => (
                      <button key={lt} type="button" className={liftType === lt ? 'active' : ''} onClick={() => setLiftType(lt)} style={{ flex: 1, fontSize: 11, letterSpacing: '0.08em' }}>
                        {lt === 'deadlift' ? 'DL' : lt.slice(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="weight" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Weight (kg)</label>
                  <div style={{ position: 'relative' }}>
                    <input id="weight" type="number" className="ss-input" placeholder="140" min="0.1" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
                  </div>
                </div>

                {/* Reps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="reps" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Reps</label>
                  <input id="reps" type="number" className="ss-input" placeholder="3" min="1" step="1" value={reps} onChange={e => setReps(e.target.value)} />
                </div>

                {/* RPE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="rpe" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    RPE <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional, 1–10)</span>
                  </label>
                  <input id="rpe" type="number" className="ss-input" placeholder="8.5" min="1" max="10" step="0.5" value={rpe} onChange={e => setRpe(e.target.value)} />
                </div>

                <AnimatePresence>
                  {logError && (
                    <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff6b6b' }}
                      role="alert"
                    >
                      <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />{logError}
                    </motion.div>
                  )}
                  {logStatus === 'success' && (
                    <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}
                      role="status"
                    >
                      <CheckCircle size={14} style={{ flexShrink: 0 }} />Lift logged!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="hover-btn-wrap" style={{ display: 'block' }}>
                  <button type="submit" className="hover-btn" style={{ width: '100%' }} disabled={logStatus === 'saving'} aria-busy={logStatus === 'saving'}>
                    {logStatus === 'saving' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />LOGGING…
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)' }}>HISTORY</h3>
              <div className="unit-toggle">
                {(['all', ...LIFT_TYPES] as const).map(f => (
                  <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '5px 10px' }}>
                    {f === 'all' ? 'ALL' : f === 'deadlift' ? 'DL' : f.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1.5rem 0', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Loading…
              </div>
            ) : filtered.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', padding: '1.5rem 0' }}>
                {history.length === 0 ? 'No lifts logged yet. Record your first set!' : `No ${filter} lifts found.`}
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="ss-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lift</th>
                      <th>Weight</th>
                      <th>Reps</th>
                      <th>RPE</th>
                      <th style={{ textAlign: 'right', color: 'var(--teal)' }}>e1RM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lift => (
                      <motion.tr key={lift.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{formatDate(lift.created_at)}</td>
                        <td style={{ color: LIFT_COLOR[lift.lift_type] ?? 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>{lift.lift_type}</td>
                        <td>{lift.weight} kg</td>
                        <td>{lift.reps}</td>
                        <td style={{ color: 'var(--text-3)' }}>{lift.rpe != null ? lift.rpe : '—'}</td>
                        <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNum(lift.e1rm, 1)} kg</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { main > div:nth-child(3) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
