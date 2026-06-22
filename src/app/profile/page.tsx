'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import {
  apiGetProfile,
  apiUpdateProfile,
  removeToken,
  isAuthenticated,
  type ProfileResponse,
} from '@/lib/api';

const AGE_CATEGORIES = ['Open', 'Junior', 'Sub-Junior', 'Master 1', 'Master 2', 'Master 3', 'Master 4'];
const DIVISIONS = ['Raw', 'Equipped', 'Single-Ply', 'Multi-Ply', 'Classic Raw'];

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function ProfilePage() {
  const router = useRouter();

  // form state
  const [name, setName] = useState('');
  const [bodyweight, setBodyweight] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [division, setDivision] = useState('');

  // ui state
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  // redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  // fetch current profile on mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    apiGetProfile()
      .then((p: ProfileResponse) => {
        setProfileExists(true);
        setName(p.name ?? '');
        setBodyweight(p.bodyweight != null ? String(p.bodyweight) : '');
        setAgeCategory(p.age_category ?? '');
        setDivision(p.division ?? '');
      })
      .catch(err => {
        // 404 means profile not yet created — that's fine
        if (!(err instanceof Error && err.message.includes('404'))) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load profile.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    setErrorMsg(null);
    setSaveStatus('saving');
    try {
      await apiUpdateProfile({
        name: name.trim(),
        bodyweight: bodyweight ? parseFloat(bodyweight) : null,
        age_category: ageCategory || null,
        division: division || null,
      });
      setProfileExists(true);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed.');
      setSaveStatus('error');
    }
  }

  function handleLogout() {
    removeToken();
    router.push('/login');
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 62 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, border: '2px solid rgba(229,57,53,0.3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.15em' }}>LOADING PROFILE…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <main>
      {/* Page header */}
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label">Athlete</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>
              MY PROFILE
            </h1>
            <p style={{ color: 'var(--text-2)', maxWidth: 480, fontSize: 17, marginTop: '1rem' }}>
              {profileExists ? 'Update your athlete information.' : 'Set up your athlete profile to get started.'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)', borderRadius: 8, padding: '9px 16px', color: 'var(--red)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
            SIGN OUT
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1rem, 5vw, 2rem) 5rem', display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="card-glow">
          <div className="card-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(229,57,53,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,57,53,0.25)', flexShrink: 0 }}>
                <User size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', color: 'var(--text-2)' }}>
                ATHLETE INFO
              </h2>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="name" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Full Name <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="ss-input"
                    style={{ fontSize: 16 }}
                    placeholder="John Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* Bodyweight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="bodyweight" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Bodyweight (kg)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="bodyweight"
                      type="number"
                      className="ss-input"
                      placeholder="83.5"
                      min="1"
                      step="0.1"
                      value={bodyweight}
                      onChange={e => setBodyweight(e.target.value)}
                    />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
                  </div>
                </div>

                {/* Age Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="age-category" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Age Category
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="age-category"
                      className="ss-select"
                      value={ageCategory}
                      onChange={e => setAgeCategory(e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {AGE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)', fontSize: 12 }}>▼</span>
                  </div>
                </div>

                {/* Division */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label htmlFor="division" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Division
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="division"
                      className="ss-select"
                      value={division}
                      onChange={e => setDivision(e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {DIVISIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)', fontSize: 12 }}>▼</span>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff6b6b' }}
                      role="alert"
                    >
                      <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                  {saveStatus === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.35)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}
                      role="status"
                    >
                      <CheckCircle size={14} style={{ flexShrink: 0 }} />
                      Profile saved successfully.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="hover-btn-wrap" style={{ display: 'block', marginTop: '0.25rem' }}>
                  <button
                    type="submit"
                    className="hover-btn"
                    style={{ width: '100%' }}
                    disabled={saveStatus === 'saving'}
                    aria-busy={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        SAVING…
                      </span>
                    ) : profileExists ? 'UPDATE PROFILE' : 'SAVE PROFILE'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Athlete card / summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div
            className="card-glow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-inner" style={{ padding: '2rem' }}>
              <div className="section-label" style={{ marginBottom: '1.25rem' }}>Current Profile</div>

              {profileExists && name ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 6vw, 48px)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {name || '—'}
                  </div>
                  <div style={{ width: 36, height: 2, background: 'var(--red)', borderRadius: 1 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    {[
                      { label: 'Bodyweight', value: bodyweight ? `${bodyweight} kg` : '—' },
                      { label: 'Age Category', value: ageCategory || '—' },
                      { label: 'Division', value: division || '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 17, color: 'var(--text-2)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
                  Fill in the form to create your athlete profile.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ padding: '1.5rem' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.75rem' }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '/1rm', label: '1RM Calculator & Lift Log' },
                { href: '/meet-planner', label: 'Meet Planner & Attempts' },
                { href: '/dots', label: 'DOTS Score Calculator' },
              ].map(link => (
                <a key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-2)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
                  {link.label}
                  <span style={{ color: 'var(--red)', fontSize: 18 }}>→</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { main > div:nth-child(2) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
