'use client';

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAttempts, generateWarmupRamp, calculatePlates, formatNum } from '@/lib/calculators';
import {
  isAuthenticated,
  apiCreateMeet,
  apiGetMeets,
  apiCreateAttempt,
  apiGetAttempts,
  type MeetResponse,
  type AttemptResponse,
  type AttemptCreate,
} from '@/lib/api';
import { CalendarDays, Plus, ChevronDown, ChevronUp, CheckCircle, AlertCircle, LogIn } from 'lucide-react';

const lifts = ['SQUAT', 'BENCH', 'DEADLIFT'] as const;
type LiftKey = typeof lifts[number];
type LiftType = 'squat' | 'bench' | 'deadlift';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = { planned: 'Planned', good_lift: '✓ Good', no_lift: '✗ No Lift' };
const STATUS_COLORS: Record<string, string> = { planned: 'var(--text-3)', good_lift: 'var(--teal)', no_lift: 'var(--red)' };

// ── Local calculator section ─────────────────────────────────────────────────
function LocalCalculator() {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [maxes, setMaxes] = useState({ SQUAT: '', BENCH: '', DEADLIFT: '' });
  const [results, setResults] = useState<Record<string, ReturnType<typeof calculateAttempts>> | null>(null);
  const [warmupLift, setWarmupLift] = useState<LiftKey>('SQUAT');

  const calculate = useCallback(() => {
    const r: Record<string, ReturnType<typeof calculateAttempts>> = {};
    lifts.forEach(l => {
      const v = parseFloat(maxes[l]);
      if (v) r[l] = calculateAttempts(v, 0.875, 0.950, 1.0, unit);
    });
    setResults(Object.keys(r).length > 0 ? r : null);
  }, [maxes, unit]);

  const warmupSets = results?.[warmupLift] ? generateWarmupRamp(results[warmupLift].opener, unit) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
  );
}

// ── Attempt grid for a single meet ──────────────────────────────────────────
function AttemptGrid({ meetId }: { meetId: string }) {
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [attemptNum, setAttemptNum] = useState<1 | 2 | 3>(1);
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<'planned' | 'good_lift' | 'no_lift'>('planned');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    apiGetAttempts(meetId)
      .then(setAttempts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meetId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w <= 0) { setFeedback({ type: 'err', msg: 'Weight must be > 0.' }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      const payload: AttemptCreate = { lift_type: liftType, attempt_number: attemptNum, weight: w, status };
      const updated = await apiCreateAttempt(meetId, payload);
      setAttempts(prev => {
        const idx = prev.findIndex(a => a.lift_type === updated.lift_type && a.attempt_number === updated.attempt_number);
        return idx >= 0 ? prev.map((a, i) => (i === idx ? updated : a)) : [...prev, updated];
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

  const byLift = (lt: string) => attempts.filter(a => a.lift_type === lt).sort((a, b) => a.attempt_number - b.attempt_number);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
      {/* Attempt form */}
      <div className="card-glow" style={{ gridColumn: '1 / -1' }}>
        <div className="card-inner" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '1rem' }}>LOG / UPDATE ATTEMPT</h4>
          <form onSubmit={handleSave} noValidate>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
              {/* Lift type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Lift</label>
                <div className="unit-toggle">
                  {(['squat', 'bench', 'deadlift'] as LiftType[]).map(lt => (
                    <button key={lt} type="button" className={liftType === lt ? 'active' : ''} onClick={() => setLiftType(lt)} style={{ fontSize: 10, padding: '6px 10px' }}>
                      {lt === 'deadlift' ? 'DL' : lt.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {/* Attempt # */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Attempt</label>
                <div className="unit-toggle">
                  {([1, 2, 3] as const).map(n => (
                    <button key={n} type="button" className={attemptNum === n ? 'active' : ''} onClick={() => setAttemptNum(n)} style={{ fontSize: 10, padding: '6px 12px' }}>{n}</button>
                  ))}
                </div>
              </div>
              {/* Weight */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 100px', minWidth: 100 }}>
                <label htmlFor={`w-${meetId}`} style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Weight (kg)</label>
                <div style={{ position: 'relative' }}>
                  <input id={`w-${meetId}`} type="number" className="ss-input" style={{ fontSize: 16 }} placeholder="200" min="0.1" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
                </div>
              </div>
              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Status</label>
                <div className="unit-toggle">
                  {(['planned', 'good_lift', 'no_lift'] as const).map(s => (
                    <button key={s} type="button" className={status === s ? 'active' : ''} onClick={() => setStatus(s)} style={{ fontSize: 10, padding: '6px 10px' }}>
                      {s === 'planned' ? 'Planned' : s === 'good_lift' ? '✓ Good' : '✗ No Lift'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Save */}
              <div className="hover-btn-wrap" style={{ alignSelf: 'flex-end' }}>
                <button type="submit" className="hover-btn" style={{ padding: '11px 20px', fontSize: 13 }} disabled={saving}>
                  {saving ? '…' : 'SAVE'}
                </button>
              </div>
            </div>
            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div key="fb" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.75rem', padding: '8px 12px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, background: feedback.type === 'ok' ? 'rgba(0,191,165,0.1)' : 'rgba(229,57,53,0.1)', border: `1px solid ${feedback.type === 'ok' ? 'rgba(0,191,165,0.35)' : 'rgba(229,57,53,0.35)'}`, color: feedback.type === 'ok' ? 'var(--teal)' : '#ff6b6b' }}
                  role={feedback.type === 'ok' ? 'status' : 'alert'}
                >
                  {feedback.type === 'ok' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  {feedback.msg}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Attempts table */}
      {loading ? (
        <div style={{ gridColumn: '1 / -1', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>Loading attempts…</div>
      ) : (
        <div style={{ gridColumn: '1 / -1', overflowX: 'auto' }}>
          <table className="ss-table">
            <thead>
              <tr><th>Lift</th><th>Attempt</th><th>Weight</th><th style={{ textAlign: 'right' }}>Status</th></tr>
            </thead>
            <tbody>
              {(['squat', 'bench', 'deadlift'] as LiftType[]).flatMap(lt =>
                byLift(lt).map(a => (
                  <tr key={a.id}>
                    <td style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', color: lt === 'squat' ? 'var(--red)' : lt === 'bench' ? 'var(--teal)' : '#ffab00' }}>{lt}</td>
                    <td style={{ color: 'var(--text-3)' }}>Attempt {a.attempt_number}</td>
                    <td>{a.weight} kg</td>
                    <td style={{ textAlign: 'right', color: STATUS_COLORS[a.status] ?? 'var(--text-2)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{STATUS_LABELS[a.status] ?? a.status}</td>
                  </tr>
                ))
              )}
              {attempts.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1rem' }}>No attempts logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Meet card ────────────────────────────────────────────────────────────────
function MeetCard({ meet }: { meet: MeetResponse }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div className="card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card-inner" style={{ padding: '1.5rem' }}>
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: 0 }}
          aria-expanded={expanded}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '0.04em', color: 'var(--text)' }}>{meet.meet_name}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{formatDate(meet.date)}</span>
              {meet.federation && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>{meet.federation}</span>}
            </div>
          </div>
          <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <AttemptGrid meetId={meet.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function MeetPlannerPage() {
  const [loggedIn] = useState(() => isAuthenticated());
  const [activeTab, setActiveTab] = useState<'planner' | 'meets'>('planner');

  // Create meet form
  const [meetName, setMeetName] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [federation, setFederation] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Meet list
  const [meets, setMeets] = useState<MeetResponse[]>([]);
  const [meetsLoading, setMeetsLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn || activeTab !== 'meets') return;
    setMeetsLoading(true);
    apiGetMeets()
      .then(setMeets)
      .catch(() => {})
      .finally(() => setMeetsLoading(false));
  }, [loggedIn, activeTab]);

  async function handleCreateMeet(e: FormEvent) {
    e.preventDefault();
    if (!meetName.trim() || !meetDate) { setCreateError('Name and date are required.'); return; }
    setCreateError(null);
    setCreating(true);
    try {
      const newMeet = await apiCreateMeet({ meet_name: meetName.trim(), date: new Date(meetDate).toISOString(), federation: federation.trim() || null });
      setMeets(prev => [...prev, newMeet].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setMeetName('');
      setMeetDate('');
      setFederation('');
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
      setActiveTab('meets');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create meet.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Planner</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>MEET PLANNER</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Auto-generate attempts and warmups. Sign in to save competition schedules and track attempt results.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1rem, 5vw, 2rem)', display: 'flex', gap: 0 }}>
          {[
            { key: 'planner', label: 'Attempt Calculator' },
            { key: 'meets', label: loggedIn ? 'My Competitions' : 'My Competitions 🔒' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'planner' | 'meets')}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === tab.key ? 'var(--text)' : 'var(--text-3)', borderBottom: activeTab === tab.key ? '2px solid var(--red)' : '2px solid transparent', transition: 'color 0.2s', marginBottom: -1 }}
              aria-selected={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div key="planner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LocalCalculator />
            </motion.div>
          )}

          {activeTab === 'meets' && (
            <motion.div key="meets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!loggedIn ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                  <CalendarDays size={40} style={{ color: 'var(--text-3)', marginBottom: '1rem' }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-2)', marginBottom: '1.5rem' }}>Sign in to create and manage your competition schedule.</p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div className="hover-btn-wrap"><a href="/login" className="hover-btn" style={{ gap: 8 }}><LogIn size={16} />SIGN IN</a></div>
                    <div className="hover-btn-wrap"><a href="/register" className="hover-btn">CREATE ACCOUNT</a></div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '2rem', alignItems: 'start' }}>
                  {/* Create meet form */}
                  <div className="card-glow">
                    <div className="card-inner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(229,57,53,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,57,53,0.25)', flexShrink: 0 }}>
                          <Plus size={18} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)' }}>NEW COMPETITION</h2>
                      </div>
                      <form onSubmit={handleCreateMeet} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label htmlFor="meet-name" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Competition Name <span style={{ color: 'var(--red)' }}>*</span></label>
                            <input id="meet-name" type="text" className="ss-input" style={{ fontSize: 15 }} placeholder="National Championships 2026" value={meetName} onChange={e => setMeetName(e.target.value)} required />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label htmlFor="meet-date" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Date <span style={{ color: 'var(--red)' }}>*</span></label>
                            <input id="meet-date" type="date" className="ss-input" style={{ fontSize: 15, colorScheme: 'dark' }} value={meetDate} onChange={e => setMeetDate(e.target.value)} required />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label htmlFor="federation" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Federation</label>
                            <input id="federation" type="text" className="ss-input" style={{ fontSize: 15 }} placeholder="IPF, USAPL, PABERSI…" value={federation} onChange={e => setFederation(e.target.value)} />
                          </div>

                          <AnimatePresence>
                            {createError && (
                              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.35)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff6b6b' }}
                                role="alert"
                              >
                                <AlertCircle size={13} />{createError}
                              </motion.div>
                            )}
                            {createSuccess && (
                              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.35)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}
                                role="status"
                              >
                                <CheckCircle size={13} />Competition created!
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="hover-btn-wrap" style={{ display: 'block' }}>
                            <button type="submit" className="hover-btn" style={{ width: '100%' }} disabled={creating} aria-busy={creating}>
                              {creating ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />CREATING…
                                </span>
                              ) : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} />CREATE MEET</span>}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Meet list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '0.25rem' }}>YOUR COMPETITIONS</div>
                    {meetsLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Loading meets…
                      </div>
                    ) : meets.length === 0 ? (
                      <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>No competitions yet. Create your first one.</p>
                      </div>
                    ) : (
                      meets.map(meet => <MeetCard key={meet.id} meet={meet} />)
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
