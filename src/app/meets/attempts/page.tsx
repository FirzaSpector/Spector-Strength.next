'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  isAuthenticated,
  apiGetMeets,
  apiCreateAttempt,
  apiGetAttempts,
  type MeetResponse,
  type AttemptResponse,
  type AttemptCreate,
} from '@/lib/api';

const LIFT_TYPES = ['squat', 'bench', 'deadlift'] as const;
type LiftType = typeof LIFT_TYPES[number];

const STATUS_OPTS = [
  { value: 'planned',   label: 'Planned',   color: 'var(--text-3)' },
  { value: 'good_lift', label: '✓ Good Lift', color: 'var(--teal)' },
  { value: 'no_lift',   label: '✗ No Lift',   color: 'var(--red)' },
] as const;

const LIFT_COLOR: Record<string, string> = { squat: 'var(--red)', bench: 'var(--teal)', deadlift: '#ffab00' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Inner component that reads search params ─────────────────────────────────
function AttemptsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [meets, setMeets] = useState<MeetResponse[]>([]);
  const [selectedMeetId, setSelectedMeetId] = useState<string>('');
  const [meetsLoading, setMeetsLoading] = useState(true);

  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // form
  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [attemptNum, setAttemptNum] = useState<1 | 2 | 3>(1);
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<'planned' | 'good_lift' | 'no_lift'>('planned');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    apiGetMeets()
      .then(data => {
        setMeets(data);
        // pre-select from query param
        const paramId = params.get('meet');
        if (paramId && data.find(m => m.id === paramId)) {
          setSelectedMeetId(paramId);
        } else if (data.length > 0) {
          setSelectedMeetId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setMeetsLoading(false));
  }, [router, params]);

  // load attempts whenever selected meet changes
  useEffect(() => {
    if (!selectedMeetId) return;
    setAttemptsLoading(true);
    apiGetAttempts(selectedMeetId)
      .then(setAttempts)
      .catch(() => {})
      .finally(() => setAttemptsLoading(false));
  }, [selectedMeetId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w <= 0) { setFeedback({ type: 'err', msg: 'Weight must be greater than 0.' }); return; }
    if (!selectedMeetId) { setFeedback({ type: 'err', msg: 'Select a competition first.' }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      const payload: AttemptCreate = { lift_type: liftType, attempt_number: attemptNum, weight: w, status };
      const updated = await apiCreateAttempt(selectedMeetId, payload);
      setAttempts(prev => {
        const idx = prev.findIndex(a => a.lift_type === updated.lift_type && a.attempt_number === updated.attempt_number);
        return idx >= 0 ? prev.map((a, i) => i === idx ? updated : a) : [...prev, updated];
      });
      setWeight('');
      setFeedback({ type: 'ok', msg: 'Attempt saved.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'err', msg: err instanceof Error ? err.message : 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  const selectedMeet = meets.find(m => m.id === selectedMeetId);
  const byLift = (lt: string) => attempts.filter(a => a.lift_type === lt).sort((a, b) => a.attempt_number - b.attempt_number);

  // Summary: total and lift totals
  const goodLifts = attempts.filter(a => a.status === 'good_lift');
  const liftBests: Record<string, number> = {};
  goodLifts.forEach(a => {
    if (!liftBests[a.lift_type] || a.weight > liftBests[a.lift_type]) liftBests[a.lift_type] = a.weight;
  });
  const total = Object.values(liftBests).reduce((s, v) => s + v, 0);

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
            <a href="/meets" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', letterSpacing: '0.1em' }}>
              <ArrowLeft size={13} />MEETS
            </a>
          </div>
          <div className="section-label">Tracker</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>
            ATTEMPTS
          </h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>
            Plan and track your 3-attempt strategy for squat, bench, and deadlift.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem' }}>

        {/* Meet selector */}
        <div className="card-glow" style={{ marginBottom: '1.5rem' }}>
          <div className="card-inner" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <ListChecks size={18} style={{ color: 'var(--red)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Competition</span>
              </div>
              {meetsLoading ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>Loading…</span>
              ) : meets.length === 0 ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                  No meets yet —{' '}
                  <a href="/meets" style={{ color: 'var(--red)', textDecoration: 'none' }}>create one first</a>
                </span>
              ) : (
                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 400 }}>
                  <select
                    className="ss-select"
                    style={{ fontSize: 15 }}
                    value={selectedMeetId}
                    onChange={e => setSelectedMeetId(e.target.value)}
                  >
                    {meets.map(m => (
                      <option key={m.id} value={m.id}>{m.meet_name} — {formatDate(m.date)}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)', fontSize: 12 }}>▼</span>
                </div>
              )}
              {selectedMeet?.federation && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', padding: '3px 9px', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 6 }}>
                  {selectedMeet.federation}
                </span>
              )}
            </div>
          </div>
        </div>

        {selectedMeetId && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Log form */}
            <div className="card-glow">
              <div className="card-inner">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '1.5rem' }}>LOG ATTEMPT</h3>
                <form onSubmit={handleSave} noValidate>
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

                    {/* Attempt # */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Attempt #</label>
                      <div className="unit-toggle" style={{ width: '100%' }}>
                        {([1, 2, 3] as const).map(n => (
                          <button key={n} type="button" className={attemptNum === n ? 'active' : ''} onClick={() => setAttemptNum(n)} style={{ flex: 1, fontSize: 13 }}>{n}</button>
                        ))}
                      </div>
                    </div>

                    {/* Weight */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label htmlFor="attempt-weight" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Weight (kg)</label>
                      <div style={{ position: 'relative' }}>
                        <input id="attempt-weight" type="number" className="ss-input" placeholder="200" min="0.1" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Result</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {STATUS_OPTS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatus(opt.value)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 14px', borderRadius: 8, border: `1px solid ${status === opt.value ? opt.color : 'var(--border)'}`,
                              background: status === opt.value ? `${opt.color}12` : 'transparent',
                              cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                              color: status === opt.value ? opt.color : 'var(--text-3)',
                              transition: 'all 0.15s', textAlign: 'left',
                            }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: status === opt.value ? opt.color : 'var(--border)', flexShrink: 0 }} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {feedback && (
                        <motion.div key="fb" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, background: feedback.type === 'ok' ? 'rgba(0,191,165,0.1)' : 'rgba(229,57,53,0.1)', border: `1px solid ${feedback.type === 'ok' ? 'rgba(0,191,165,0.35)' : 'rgba(229,57,53,0.35)'}`, color: feedback.type === 'ok' ? 'var(--teal)' : '#ff6b6b' }}
                          role={feedback.type === 'ok' ? 'status' : 'alert'}
                        >
                          {feedback.type === 'ok' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}{feedback.msg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="hover-btn-wrap" style={{ display: 'block' }}>
                      <button type="submit" className="hover-btn" style={{ width: '100%' }} disabled={saving} aria-busy={saving}>
                        {saving ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />SAVING…
                          </span>
                        ) : 'SAVE ATTEMPT'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Attempt grid */}
              <div className="card-glow">
                <div className="card-inner">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '1rem' }}>ATTEMPT GRID</h3>
                  {attemptsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Loading…
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="ss-table">
                        <thead>
                          <tr>
                            <th>Lift</th>
                            <th style={{ textAlign: 'center' }}>Attempt 1</th>
                            <th style={{ textAlign: 'center' }}>Attempt 2</th>
                            <th style={{ textAlign: 'center' }}>Attempt 3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {LIFT_TYPES.map(lt => {
                            const row = byLift(lt);
                            return (
                              <tr key={lt}>
                                <td style={{ color: LIFT_COLOR[lt], fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>{lt}</td>
                                {([1, 2, 3] as const).map(n => {
                                  const a = row.find(x => x.attempt_number === n);
                                  const sc = a ? (a.status === 'good_lift' ? 'var(--teal)' : a.status === 'no_lift' ? 'var(--red)' : 'var(--text-2)') : 'var(--text-3)';
                                  return (
                                    <td key={n} style={{ textAlign: 'center', color: sc, fontFamily: 'var(--font-mono)', fontWeight: a?.status !== 'planned' ? 700 : 400 }}>
                                      {a ? `${a.weight} kg` : '—'}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Scorecard */}
              {Object.keys(liftBests).length > 0 && (
                <motion.div className="card-glow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="card-inner">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '1rem' }}>SCORECARD</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {LIFT_TYPES.filter(lt => liftBests[lt]).map(lt => (
                        <div key={lt}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>{lt}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: LIFT_COLOR[lt], lineHeight: 1 }}>{liftBests[lt]} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)' }}>kg</span></div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(liftBests).length === 3 && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>Total</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{total} <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-3)' }}>kg</span></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { main > div:nth-child(2) > div:nth-child(2) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}

// Wrap in Suspense so useSearchParams works with SSR
export default function MeetAttemptsPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 62 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    }>
      <AttemptsContent />
    </Suspense>
  );
}
