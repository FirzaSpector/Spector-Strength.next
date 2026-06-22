'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogIn, ChevronDown, Dumbbell, CalendarDays, ListChecks } from 'lucide-react';
import { isAuthenticated } from '@/lib/api';

const links = [
  { href: '/', label: 'Home' },
  { href: '/1rm', label: '1RM Calc' },
  { href: '/dots', label: 'DOTS' },
  { href: '/meet-planner', label: 'Meet Plan' },
  { href: '/plate-calculator', label: 'Plates' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About' },
];

const trackerLinks = [
  { href: '/lifts', label: 'Lifts', icon: Dumbbell, desc: 'Log & view lift history' },
  { href: '/meets', label: 'Meets', icon: CalendarDays, desc: 'Manage competitions' },
  { href: '/meets/attempts', label: 'Attempts', icon: ListChecks, desc: 'Track attempt results' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const trackerActive = trackerLinks.some(l => pathname.startsWith(l.href));

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
        {/* Logo */}
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

        {/* Desktop nav */}
        <ul
          style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', listStyle: 'none' }}
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

          {/* Tracker dropdown */}
          <li ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                letterSpacing: '0.03em',
                color: trackerActive || dropdownOpen ? 'var(--text)' : 'var(--text-3)',
                background: trackerActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: 'none', cursor: 'pointer', padding: '5px 11px', borderRadius: 8,
                transition: 'color 0.2s, background 0.2s',
                position: 'relative',
              }}
            >
              Tracker
              <ChevronDown
                size={13}
                style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
              {trackerActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 18, height: 2, background: 'var(--red)', borderRadius: 1,
                }} />
              )}
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 220,
                  background: 'rgba(8,8,8,0.97)',
                  border: '1px solid var(--border-hi)',
                  borderRadius: 12,
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                  zIndex: 1001,
                }}
                role="menu"
              >
                {/* Header */}
                <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    {authed ? 'Your Data' : 'Sign in required'}
                  </span>
                </div>

                {trackerLinks.map(({ href, label, icon: Icon, desc }) => {
                  const active = pathname === href || (href === '/meets/attempts' && pathname.startsWith('/meets/') && pathname.includes('/attempts'));
                  return (
                    <Link
                      key={href}
                      href={authed ? href : '/login'}
                      role="menuitem"
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 11,
                        padding: '11px 14px',
                        textDecoration: 'none',
                        background: active ? 'rgba(229,57,53,0.07)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? 'rgba(229,57,53,0.07)' : 'transparent'; }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: active ? 'rgba(229,57,53,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--red)' : 'var(--text-3)', flexShrink: 0, marginTop: 1 }}>
                        <Icon size={15} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: active ? 'var(--text)' : 'var(--text-2)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.04em' }}>{desc}</div>
                      </div>
                    </Link>
                  );
                })}

                {/* Sign-in nudge when not authed */}
                {!authed && (
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <LogIn size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)' }}>Sign in to access tracker</span>
                  </div>
                )}
              </div>
            )}
          </li>

          {/* Auth pill */}
          <li style={{ marginLeft: 6 }}>
            <Link
              href={authed ? '/profile' : '/login'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: authed ? 'var(--teal)' : 'var(--text-3)',
                textDecoration: 'none', padding: '6px 12px',
                borderRadius: 8, border: `1px solid ${authed ? 'rgba(0,191,165,0.3)' : 'rgba(255,255,255,0.08)'}`,
                background: authed ? 'rgba(0,191,165,0.06)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {authed ? <><User size={14} />Profile</> : <><LogIn size={14} />Sign In</>}
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
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
          maxHeight: mobileOpen ? 600 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1), padding 0.4s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}
        className="show-mobile"
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600,
              color: pathname === href ? 'var(--text)' : 'var(--text-3)',
              textDecoration: 'none', padding: '9px 12px', borderRadius: 8,
              display: 'block',
            }}
          >
            {label}
          </Link>
        ))}

        {/* Tracker section in mobile */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 4px', paddingTop: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '2px 12px 8px' }}>Tracker</div>
          {trackerLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={authed ? href : '/login'}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
                color: (pathname === href) ? 'var(--text)' : authed ? 'var(--text-2)' : 'var(--text-3)',
                textDecoration: 'none', padding: '9px 12px', borderRadius: 8,
              }}
            >
              <Icon size={16} style={{ color: authed ? 'var(--red)' : 'var(--text-3)', flexShrink: 0 }} />
              {label}
              {!authed && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>🔒</span>}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <Link
          href={authed ? '/profile' : '/login'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
            color: authed ? 'var(--teal)' : 'var(--text-3)',
            textDecoration: 'none', padding: '9px 12px', borderRadius: 8,
          }}
        >
          {authed ? <><User size={16} />Profile</> : <><LogIn size={16} />Sign In</>}
        </Link>
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
