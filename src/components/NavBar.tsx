'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/1rm', label: '1RM Calc' },
  { href: '/dots', label: 'DOTS' },
  { href: '/meet-planner', label: 'Meet Plan' },
  { href: '/plate-calculator', label: 'Plates' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 62,
          zIndex: 1000,
          display: 'flex', alignItems: 'center', padding: '0 clamp(1.25rem, 5vw, 2.5rem)', gap: '1.5rem',
          background: scrolled ? 'rgba(5,5,5,0.92)' : 'rgba(5,5,5,0.45)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          borderBottom: scrolled ? '1px solid var(--border-hi)' : '1px solid rgba(255,255,255,0.04)',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(18px, 5vw, 21px)',
            letterSpacing: '0.05em', color: 'var(--text)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          SPECTOR<span style={{ color: 'var(--red)', fontWeight: 300, margin: '0 1px' }}>/</span>STRENGTH
        </Link>

        <ul
          style={{
            display: 'flex', alignItems: 'center', gap: 2,
            marginLeft: 'auto', listStyle: 'none',
          }}
          className="hidden-mobile"
        >
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                    letterSpacing: '0.03em',
                    color: active ? 'var(--text)' : 'var(--text-3)',
                    textDecoration: 'none', padding: '5px 11px',
                    borderRadius: 8, position: 'relative',
                    transition: 'color 0.2s, background 0.2s',
                    display: 'block',
                    background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: -1, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 18, height: 2, background: 'var(--red)', borderRadius: 1,
                    }} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          className="show-mobile"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'var(--text-2)', cursor: 'pointer', padding: 8, display: 'none',
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        style={{
          position: 'fixed', top: 62, left: 0, right: 0, zIndex: 999,
          background: 'rgba(5,5,5,0.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border-hi)',
          padding: mobileOpen ? '0.75rem clamp(1.25rem, 5vw, 2.5rem) 1.25rem' : '0 clamp(1.25rem, 5vw, 2.5rem)',
          maxHeight: mobileOpen ? 480 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1), padding 0.4s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}
        className="show-mobile"
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 600,
              color: pathname === href ? 'var(--text)' : 'var(--text-3)',
              textDecoration: 'none', padding: '10px 12px', borderRadius: 8,
              display: 'block',
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 768px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
