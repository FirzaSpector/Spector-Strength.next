import type { Metadata, Viewport } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Spector Strength", template: "%s — Spector Strength" },
  description: "Premium powerlifting calculators, meet planning, and training programs for serious competitors.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-3)',
        }}>
          <span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, letterSpacing: '0.08em', color: 'var(--text-2)' }}>
              SPECTOR<span style={{ color: 'var(--red)', fontWeight: 300 }}>/</span>STRENGTH
            </span>
          </span>
          <span>All calculations are estimates. © 2026 Spector Strength.</span>
        </footer>
      </body>
    </html>
  );
}
