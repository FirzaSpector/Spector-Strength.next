'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { isAuthenticated, apiCreateMeet, apiGetMeets, type MeetResponse } from '@/lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MeetsPage() {
  const router = useRouter();

  const [meetName, setMeetName] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [federation, setFederation] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [meets, setMeets] = useState<MeetResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    apiGetMeets()
      .then(setMeets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!meetName.trim() || !meetDate) { setCreateError('Name and date are required.'); return; }
    setCreateError(null);
    setCreating(true);
    try {
      const newMeet = await apiCreateMeet({
        meet_name: meetName.trim(),
        date: new Date(meetDate).toISOString(),
        federation: federation.trim() || null,
      });
      setMeets(prev => [...prev, newMeet].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setMeetName(''); setMeetDate(''); setFederation('');
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create meet.');
    } finally {
      setCreating(false);
    }
  }

  const upcoming = meets.filter(m => daysUntil(m.date) >= 0);
  const past = meets.filter(m => daysUntil(m.date) < 0);

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Tracker</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>
            COMPETITIONS
          </h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>
            Schedule your meets and plan your attempt strategy for each competition.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Create form */}
        <div className="card-glow">
          <div className="card-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(229,57,53,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,57,53,0.25)', flexShrink: 0 }}>
                <Plus size={19} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-2)' }}>NEW COMPETITION</h2>
            </div>

            <form onSubmit={handleCreate} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="meet-name" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Competition Name <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <input id="meet-name" type="text" className="ss-input" style={{ fontSize: 15 }} placeholder="National Championships 2026" value={meetName} onChange={e => setMeetName(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="meet-date" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Date <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <input id="meet-date" type="date" className="ss-input" style={{ fontSize: 15, colorScheme: 'dark' }} value={meetDate} onChange={e => setMeetDate(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Loading meets…
            </div>
          ) : meets.length === 0 ? (
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <CalendarDays size={36} style={{ color: 'var(--text-3)', marginBottom: '0.75rem' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>No competitions yet. Create your first meet!</p>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.75rem' }}>Upcoming ({upcoming.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {upcoming.map(meet => <MeetCard key={meet.id} meet={meet} daysUntil={daysUntil(meet.date)} />)}
                  </div>
                </div>
              )}
              {/* Past */}
              {past.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.75rem' }}>Past ({past.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {past.map(meet => <MeetCard key={meet.id} meet={meet} daysUntil={daysUntil(meet.date)} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { main > div:nth-child(2) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}

function MeetCard({ meet, daysUntil: days }: { meet: MeetResponse; daysUntil: number }) {
  const upcoming = days >= 0;
  return (
    <motion.div className="card-glow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card-inner" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, letterSpacing: '0.04em', color: 'var(--text)' }}>{meet.meet_name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{formatDate(meet.date)}</span>
              {meet.federation && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>{meet.federation}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {upcoming ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: days === 0 ? 'var(--teal)' : days <= 7 ? '#ffab00' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                {days === 0 ? 'Today!' : `${days}d away`}
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{Math.abs(days)}d ago</span>
            )}
            <a
              href={`/meets/attempts?meet=${meet.id}&name=${encodeURIComponent(meet.meet_name)}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--red)', textDecoration: 'none', letterSpacing: '0.06em' }}
            >
              Attempts <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
