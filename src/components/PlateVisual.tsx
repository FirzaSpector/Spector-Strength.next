'use client';

import { motion } from 'framer-motion';
import { PlateDefinition } from '@/lib/calculators';

interface PlateVisualProps {
  plates: { plate: PlateDefinition; count: number }[];
  unit: 'kg' | 'lbs';
}

export default function PlateVisual({ plates, unit }: PlateVisualProps) {
  const barWeight = unit === 'kg' ? 20 : 45;
  
  // Height mapping similar to the original CSS
  const getPlateHeight = (weight: number) => {
    if (weight === 25 || weight === 20 || weight === 45) return 100;
    if (weight === 15) return 80;
    if (weight === 10) return 68;
    if (weight === 35) return 88;
    return Math.max(36, 40 + weight * 2);
  };

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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 1, 
      padding: '1.5rem 1rem', 
      overflowX: 'auto', 
      flexWrap: 'nowrap',
      minHeight: 140 
    }}>
      {/* Left Sleeve */}
      <div style={{ width: 30, height: 8, background: 'linear-gradient(to right, #9ca3af, #6b7280)', borderRadius: 4, flexShrink: 0 }} />
      
      {/* Left Plates */}
      {renderSide(true)}

      {/* Bar Center */}
      <div style={{ height: 6, minWidth: 80, background: '#9ca3af', borderRadius: 2, flexShrink: 0 }} />

      {/* Right Plates */}
      {renderSide(false)}

      {/* Right Sleeve */}
      <div style={{ width: 30, height: 8, background: 'linear-gradient(to left, #9ca3af, #6b7280)', borderRadius: 4, flexShrink: 0 }} />
    </div>
  );
}
