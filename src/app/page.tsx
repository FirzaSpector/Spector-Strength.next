'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dumbbell, Calculator, CalendarDays, Disc3, BookOpen, Info } from 'lucide-react';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.05,
    }));

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach(p => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(229,57,53,${p.opacity})`;
        ctx!.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} aria-hidden />;
}

const tools = [
  { href: '/1rm', icon: Dumbbell, label: '1RM CALCULATOR', desc: 'Five formulas — Epley, Brzycki, Lander, Lombardi, O\'Conner — with live percentage chart.', cta: 'CALCULATE', accent: '#e53935' },
  { href: '/dots', icon: Calculator, label: 'DOTS SCORE', desc: 'Official IPF DOTS formula with tier classification: Novice → Intermediate → Advanced → Elite.', cta: 'SCORE YOURSELF', accent: '#ffab00' },
  { href: '/meet-planner', icon: CalendarDays, label: 'MEET PLANNER', desc: 'Auto-generate openers, second, and third attempts. Full warmup ramp with plate breakdown.', cta: 'PLAN MEET', accent: '#00bfa5' },
  { href: '/plate-calculator', icon: Disc3, label: 'PLATE CALCULATOR', desc: 'Color-coded plate loading with greedy algorithm. Never miscalculate a warmup set again.', cta: 'LOAD BAR', accent: '#e53935' },
  { href: '/programs', icon: BookOpen, label: 'PROGRAMS', desc: 'Curated accessory work for squat, bench, and deadlift with RPE targets and coaching cues.', cta: 'VIEW PROGRAMS', accent: '#ffab00' },
  { href: '/about', icon: Info, label: 'ABOUT', desc: 'Formula references, methodology, and acknowledgements.', cta: 'LEARN MORE', accent: '#5a5450' },
];

const stats = [
  { value: '5', label: '1RM Formulas', color: 'var(--red)' },
  { value: '3', label: 'Lifts Planned', color: 'var(--amber)' },
  { value: '21', label: 'Program Exercises', color: 'var(--teal)' },
  { value: '∞', label: 'PRs to Chase', color: 'var(--text-2)' },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 62 }}>
        <ParticleCanvas />
        {/* Hero Background Image */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/hero-section.png")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25, zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 38%, rgba(229,57,53,0.08) 0%, transparent 68%), linear-gradient(to bottom, transparent 55%, #000 100%)', zIndex: 2 }} />
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '2rem', maxWidth: 1000 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '2rem', opacity: 0.9 }}>
              <span style={{ width: 24, height: 1, background: 'currentColor', opacity: 0.5, display: 'block' }} />
              Powerlifting Tools &amp; Systems
              <span style={{ width: 24, height: 1, background: 'currentColor', opacity: 0.5, display: 'block' }} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 15vw, 188px)', letterSpacing: '-0.01em', lineHeight: 0.86, marginBottom: '2rem' }}
          >
            SPECTOR<br /><span style={{ color: 'var(--red)' }}>STRENGTH</span>
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <div style={{ width: 48, height: 2, background: 'var(--border-hi)', margin: '0 auto 1.25rem' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'clamp(13px,2vw,18px)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '3rem' }}>
              Tools and training systems for serious powerlifters.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="hover-btn-wrap">
                <Link href="/1rm" className="hover-btn">Calculate 1RM</Link>
              </div>
              <div className="hover-btn-wrap">
                <Link href="/meet-planner" className="hover-btn">Plan Your Meet</Link>
              </div>
            </div>
          </motion.div>
        </div>
        <div style={{ position: 'absolute', bottom: '2.25rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center' }} aria-hidden>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--red), transparent)', margin: '0 auto', opacity: 0.6 }} />
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.75rem clamp(1.25rem, 5vw, 2.5rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 8vw, 72px)', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 6 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section style={{ padding: '5rem clamp(1.25rem, 5vw, 2.5rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
            <div className="section-label">Your</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 8vw, 80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>TOOLS</h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 500, marginTop: '1rem', fontSize: 17 }}>Every calculation you need from the platform to the podium — built for accuracy, designed for speed.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {tools.map(({ href, icon: Icon, label, desc, cta, accent }, i) => (
              <motion.div key={href} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.55 }}>
                <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    className="card-glow"
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="card-inner">
                      <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
                        <Icon size={22} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, letterSpacing: '0.04em', marginBottom: '0.5rem', color: 'var(--text)' }}>{label}</h3>
                      <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: '1.25rem', lineHeight: 1.6 }}>{desc}</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent || 'var(--red)', opacity: 0.8 }}>
                        {cta} <span>→</span>
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ padding: '8rem clamp(1.25rem, 5vw, 2.5rem)', background: '#000', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        {/* Background Image with Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/competition-gemini.png")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #000 90%)', opacity: 0.8 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(42px, 10vw, 120px)', letterSpacing: '-0.02em', lineHeight: 0.85, marginBottom: '1.5rem' }}>
            BUILT FOR<br /><span style={{ color: 'var(--red)', textShadow: '0 0 40px rgba(229,57,53,0.3)' }}>COMPETITION</span>
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 19, margin: '0 auto 3rem', letterSpacing: '0.04em', maxWidth: 640 }}>
            Stop guessing your openers. Stop miscounting plates. Every tool you need to compete at your best.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="hover-btn-wrap"><Link href="/meet-planner" className="hover-btn" style={{ padding: '14px 32px', fontSize: 16 }}>Plan Your Meet Now</Link></div>
            <div className="hover-btn-wrap"><Link href="/programs" className="hover-btn" style={{ padding: '14px 32px', fontSize: 16 }}>View Programs</Link></div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
