import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Formula references, methodology, and project details for Spector Strength.',
};

export default function AboutPage() {
  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Info</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(44px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>ABOUT</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 540, fontSize: 17, marginTop: '1rem' }}>Formula references, methodology, and project details.</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        {/* Disclaimer */}
        <div className="card-glow" style={{ marginBottom: '2rem' }}>
          <div className="card-inner">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.5rem' }}>Important Disclaimer</div>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7 }}>
              All calculations on Spector Strength are estimates. 1RM formulas produce theoretical maxima — actual performance depends on factors no formula can capture: sleep, nutrition, bar speed, and training history. Always train under qualified coaching. Do not use these numbers as the sole basis for competition attempt selection.
            </p>
          </div>
        </div>

        {/* 1RM Formulas */}
        <div className="card-glow" style={{ marginBottom: '1.5rem' }}>
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', marginBottom: '1.25rem', color: 'var(--red)' }}>1RM FORMULAS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Epley (1985)', formula: '1RM = w × (1 + r/30)', desc: 'Most widely cited. Most accurate for low rep sets (1–6). Slightly overestimates at higher reps.' },
                { name: 'Brzycki (1993)', formula: '1RM = w × (36 / (37 - r))', desc: 'Very accurate in the 2–10 rep range. Undefined at reps ≥ 37. Slightly conservative compared to Epley.' },
                { name: 'Lander (1985)', formula: '1RM = (100 × w) / (101.3 − 2.67123 × r)', desc: 'Published in academic literature. Good general accuracy across rep ranges.' },
                { name: 'Lombardi (1989)', formula: '1RM = w × r⁰.¹⁰', desc: 'Conservative estimate. Tends to underpredict at higher reps. Good for higher-rep sets (8–12).' },
                { name: "O'Conner et al. (1989)", formula: '1RM = w × (1 + 0.025 × r)', desc: 'Simplest approximation. Conservative. Reasonable for moderate rep ranges.' },
              ].map(f => (
                <div key={f.name} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', marginBottom: 6 }}>{f.formula}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DOTS Formula */}
        <div className="card-glow" style={{ marginBottom: '1.5rem' }}>
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', marginBottom: '1.25rem', color: 'var(--red)' }}>IPF DOTS FORMULA</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: '1rem' }}>The DOTS (Dots) formula was adopted by the IPF in 2020, replacing Wilks. It uses bodyweight-specific coefficients determined by curve-fitting to competition data across all weight classes. The formula provides more accurate bodyweight equalization at extreme ends of the weight spectrum.</p>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', marginBottom: 8 }}>DOTS = Total × (500 / f(BW))</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>f(BW) = a·BW⁴ − b·BW³ + c·BW² − d·BW + e</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.8 }}>
                Male:   a=−0.000001093,  b=0.0007391293,  c=−0.1918209091,  d=24.0900756,  e=−307.75076<br />
                Female: a=−0.0000010706, b=0.0005158568,  c=−0.1126655495,  d=13.6175032,  e=−57.96288
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>Reference: IPF Technical Rules Book, Appendix E (2020+)</p>
          </div>
        </div>

        {/* Meet Planning */}
        <div className="card-glow" style={{ marginBottom: '1.5rem' }}>
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', marginBottom: '1.25rem', color: 'var(--red)' }}>MEET PLANNING METHODOLOGY</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: '1rem' }}>Attempt selection follows conventional wisdom used by elite powerlifting coaches:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: '1st', title: 'Opener (87.5%)', color: 'var(--teal)', desc: 'A weight you can hit on a bad day with your eyes closed. Sets the total and builds confidence.', bg: 'rgba(0,191,165,0.05)', border: 'rgba(0,191,165,0.15)' },
                { label: '2nd', title: '2nd Attempt (95%)', color: 'var(--amber)', desc: 'A strong, solid lift. Should be something you\'ve hit multiple times in training.', bg: 'rgba(255,171,0,0.05)', border: 'rgba(255,171,0,0.15)' },
                { label: '3rd', title: '3rd Attempt (100%)', color: 'var(--red)', desc: 'Your maximum. May be a PR or a goal total. Only go for a true max if the 2nd moved well.', bg: 'rgba(229,57,53,0.05)', border: 'rgba(229,57,53,0.15)' },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', background: a.bg, borderRadius: 8, border: `1px solid ${a.border}` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: a.color, flexShrink: 0, lineHeight: 1 }}>{a.label}</div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card-glow" style={{ marginBottom: '1.5rem' }}>
          <div className="card-inner">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', marginBottom: '1.25rem', color: 'var(--text-2)' }}>TECH STACK</h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', lineHeight: 2.2 }}>
              <div>Next.js 16 (App Router) + TypeScript</div>
              <div>Tailwind CSS for modern design utilities</div>
              <div>Framer Motion for high-performance micro-animations</div>
              <div>Lucide React for iconography</div>
              <div>Vanilla CSS for design system tokens &amp; glassmorphism</div>
              <div>Canvas API — dynamic hero particle background</div>
              <div>Responsive Editorial Layout System</div>
            </div>
          </div>
        </div>

        {/* File Structure */}
        <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: 12, background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ marginBottom: 12, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>PROJECT ARCHITECTURE</div>
          <pre style={{ fontSize: 12, lineHeight: 1.9, color: 'var(--text-3)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
            {"/spector-strength-next\n"}
            {"  /src\n"}
            {"    /app\n"}
            {"      layout.tsx         ← Root layout & metadata\n"}
            {"      globals.css        ← Design system & glassmorphism\n"}
            {"      page.tsx           ← Home (Hero + Particles)\n"}
            {"      /1rm, /dots, ...   ← Calculator routes\n"}
            {"    /components\n"}
            {"      NavBar.tsx         ← Reactive glass navigation\n"}
            {"      PlateVisual.tsx    ← Barbell visualization engine\n"}
            {"    /lib\n"}
            {"      calculators.ts     ← Pure math & logic (TS)"}
          </pre>
        </div>
      </div>
    </main>
  );
}
