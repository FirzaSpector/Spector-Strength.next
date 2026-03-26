'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { PlateDefinition } from '@/lib/calculators';

interface PlateVisualProps {
  plates: { plate: PlateDefinition; count: number }[];
  unit: 'kg' | 'lbs';
  barWeight?: number;
  totalWeight?: number;
}

export default function PlateVisual({ plates, unit, barWeight, totalWeight }: PlateVisualProps) {
  const resolvedBarWeight = barWeight ?? (unit === 'kg' ? 20 : 45);

  const getPlateHeight = (weight: number) => {
    if (weight === 25 || weight === 20 || weight === 45) return 100;
    if (weight === 15) return 80;
    if (weight === 10) return 68;
    if (weight === 35) return 88;
    return Math.max(36, 40 + weight * 2);
  };

  // ── PNG Export ────────────────────────────────────────────────────────────
  const savePng = () => {
    // Flatten plates into individual plates (outside → inside, i.e. heaviest first)
    const flatPlates: { weight: number; label: string; color: string; textColor: string }[] = [];
    plates.forEach(({ plate, count }) => {
      for (let i = 0; i < count; i++) {
        flatPlates.push({ weight: plate.weight, label: plate.label, color: plate.color, textColor: plate.textColor });
      }
    });

    const SCALE = 3; // hi-dpi

    // ── Layout ────────────────────────────────────────────────────────────
    const PLATE_W = 33;        // width of each plate column
    const PLATE_GAP = 3;       // gap between plates
    const PLATE_H = 400;       // height of tallest plate (25kg)
    const SLEEVE_W = 60;       // collar width
    const SLEEVE_H = 100;      // collar height
    const BAR_THICKNESS = 26;  // bar height
    const BAR_EXTEND = 200;    // bar length extending right of plates
    const BOTTOM_H = 100;      // area for weight text
    const TOP_PAD = 56;        // padding above plates
    const LEFT_PAD = 40;       // left margin
    const RIGHT_PAD = 24;

    const numPlates = flatPlates.length;
    const platesW = numPlates * PLATE_W + Math.max(0, numPlates - 1) * PLATE_GAP;
    const canvasW = LEFT_PAD + SLEEVE_W + PLATE_GAP + platesW + PLATE_GAP + BAR_EXTEND + RIGHT_PAD;
    const canvasH = TOP_PAD + PLATE_H + BOTTOM_H;
    const barMidY = TOP_PAD + PLATE_H / 2; // vertical centre of everything

    const canvas = document.createElement('canvas');
    canvas.width = canvasW * SCALE;
    canvas.height = canvasH * SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(SCALE, SCALE);

    // ── Background: transparent (no fill) ────────────────────────────────

    // ── Helpers ───────────────────────────────────────────────────────────
    const rrect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawBar = (x: number, w: number) => {
      const y = barMidY - BAR_THICKNESS / 2;
      const g = ctx.createLinearGradient(x, y, x, y + BAR_THICKNESS);
      g.addColorStop(0, '#c8c8c8');
      g.addColorStop(0.4, '#a0a0a0');
      g.addColorStop(1, '#6b7280');
      ctx.fillStyle = g;
      rrect(x, y, w, BAR_THICKNESS, 4);
      ctx.fill();
    };

    let curX = LEFT_PAD;

    // ── Sleeve / collar ───────────────────────────────────────────────────
    const sleeveY = barMidY - SLEEVE_H / 2;
    const sleeveG = ctx.createLinearGradient(curX, sleeveY, curX, sleeveY + SLEEVE_H);
    sleeveG.addColorStop(0, '#d1d5db');
    sleeveG.addColorStop(0.5, '#9ca3af');
    sleeveG.addColorStop(1, '#6b7280');
    ctx.fillStyle = sleeveG;
    rrect(curX, sleeveY, SLEEVE_W, SLEEVE_H, 5);
    ctx.fill();

    // Black outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    rrect(curX, sleeveY, SLEEVE_W, SLEEVE_H, 5);
    ctx.stroke();

    // Bar-weight text on the sleeve
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 28px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(resolvedBarWeight), curX + SLEEVE_W / 2, barMidY);

    curX += SLEEVE_W + PLATE_GAP;

    // ── Plates ────────────────────────────────────────────────────────────
    const getPlateCanvasH = (w: number): number => {
      if (w >= 25 || w === 45) return PLATE_H;
      if (w === 20) return Math.round(PLATE_H * 0.88);
      if (w === 15 || w === 35) return Math.round(PLATE_H * 0.76);
      if (w === 10) return Math.round(PLATE_H * 0.65);
      if (w === 5) return Math.round(PLATE_H * 0.53);
      if (w === 2.5) return Math.round(PLATE_H * 0.44);
      return Math.round(PLATE_H * 0.36);
    };

    flatPlates.forEach((p, idx) => {
      const ph = getPlateCanvasH(p.weight);
      const py = barMidY - ph / 2;
      const tc = p.textColor || '#fff';

      // Plate fill
      ctx.fillStyle = p.color;
      rrect(curX, py, PLATE_W, ph, 4);
      ctx.fill();

      // Black border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      rrect(curX, py, PLATE_W, ph, 4);
      ctx.stroke();

      const cx = curX + PLATE_W / 2;

      // ① Order number at top
      ctx.fillStyle = tc;
      ctx.font = `bold 20px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(idx + 1), cx, py + 10);

      // ② Plate weight — rotated 90° in the centre
      ctx.save();
      ctx.translate(cx, barMidY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = tc;
      ctx.font = `bold 24px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, 0, 0);
      ctx.restore();

      // ③ Unit label at bottom
      ctx.fillStyle = tc;
      ctx.font = `bold 13px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(unit.toUpperCase(), cx, py + ph - 8);

      curX += PLATE_W + PLATE_GAP;
    });

    // ── Extending bar ─────────────────────────────────────────────────────
    const barStartX = curX - PLATE_GAP;
    drawBar(barStartX, BAR_EXTEND + PLATE_GAP);

    // Watermark on bar
    ctx.fillStyle = 'rgba(220,220,220,0.85)';
    ctx.font = `800 11px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('@SPECTORSTRENGTH', barStartX + BAR_EXTEND - 16, barMidY);

    // ── Weight text ───────────────────────────────────────────────────────
    const totalKg = totalWeight ?? 0;
    const totalLbs = totalKg * 2.20462;
    const textY = TOP_PAD + PLATE_H + 28;

    // Helper: measure + draw segment, return new x
    const drawSeg = (text: string, x: number, size: number, weight: string, color: string, baseline: string): number => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = baseline as CanvasTextBaseline;
      ctx.fillText(text, x, textY + (baseline === 'alphabetic' ? 70 : 0));
      return x + ctx.measureText(text).width;
    };

    // Draw large weight numbers
    let wx = LEFT_PAD;

    // "250"
    ctx.fillStyle = '#fff';
    ctx.font = `900 52px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(String(Math.round(totalKg)), wx, textY);
    wx += ctx.measureText(String(Math.round(totalKg))).width + 2;

    // "KG"
    ctx.fillStyle = '#d1d5db';
    ctx.font = `700 22px Arial, sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(unit.toUpperCase(), wx, textY + 52);
    wx += ctx.measureText(unit.toUpperCase()).width + 14;

    // "|"
    ctx.fillStyle = '#374151';
    ctx.font = `300 52px Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('|', wx, textY);
    wx += ctx.measureText('|').width + 14;

    // "551.2"
    const lbsStr = parseFloat(totalLbs.toFixed(1)).toString();
    ctx.fillStyle = '#fff';
    ctx.font = `900 52px "Arial Black", Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(lbsStr, wx, textY);
    wx += ctx.measureText(lbsStr).width + 2;

    // "LB"
    ctx.fillStyle = '#d1d5db';
    ctx.font = `700 22px Arial, sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillText('LB', wx, textY + 52);

    // ── Download ──────────────────────────────────────────────────────────
    const link = document.createElement('a');
    link.download = `spector-${Math.round(totalKg)}${unit}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ── UI Preview ────────────────────────────────────────────────────────────
  const renderSide = (isLeft: boolean) => {
    const sidePlates = isLeft ? [...plates].reverse() : plates;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {sidePlates.map(({ plate, count }, pIdx) => (
          <div key={`${isLeft ? 'L' : 'R'}-${plate.weight}-${pIdx}`} style={{ display: 'flex', gap: 1 }}>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: (isLeft ? (sidePlates.length - pIdx) : pIdx) * 0.1 }}
                style={{
                  width: 15,
                  height: getPlateHeight(plate.weight),
                  background: plate.color,
                  color: plate.textColor,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  boxShadow: '1px 0 4px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                <span style={{ transform: 'rotate(-90deg)', display: 'block', fontSize: 8, fontFamily: 'var(--font-mono)' }}>
                  {plate.label}
                </span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Live symmetric barbell */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 1, padding: '1.5rem 1rem', overflowX: 'auto',
        flexWrap: 'nowrap', minHeight: 140,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap', marginRight: 4, flexShrink: 0 }}>
          {resolvedBarWeight}{unit}
        </div>
        <div style={{ width: 30, height: 8, background: 'linear-gradient(to right, #9ca3af, #6b7280)', borderRadius: 4, flexShrink: 0 }} />
        {renderSide(true)}
        <div style={{ height: 6, minWidth: 80, background: '#9ca3af', borderRadius: 2, flexShrink: 0 }} />
        {renderSide(false)}
        <div style={{ width: 30, height: 8, background: 'linear-gradient(to left, #9ca3af, #6b7280)', borderRadius: 4, flexShrink: 0 }} />
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem 1rem' }}>
        <button
          onClick={savePng}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: 'var(--text-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Save IMAGE
        </button>
      </div>
    </div>
  );
}