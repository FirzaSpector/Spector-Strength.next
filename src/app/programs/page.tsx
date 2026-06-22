'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  intensity: string;
  intensityType: 'rpe' | 'pct' | 'light';
  muscles: string;
  cues: string[];
}

const PROGRAMS: Record<string, Exercise[]> = {
  squat: [
    {
      name: 'Pause Squat',
      sets: 4, reps: '3', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Quads, Glutes, Core Bracing',
      cues: [
        'Pause 2–3 seconds in the hole with tension maintained throughout.',
        'Keep your knees out and chest up during the pause.',
        'Drive out of the hole by pushing the floor away — not by leading with your hips.',
        'Use 10–15% less than your regular squat. The pause eliminates the stretch reflex.',
      ]
    },
    {
      name: 'Box Squat',
      sets: 5, reps: '3', intensity: '65–70%', intensityType: 'pct',
      muscles: 'Posterior Chain, Hip Drive',
      cues: [
        "Sit back onto the box — don't just touch and go, own the position.",
        'Box height should be at or slightly below parallel.',
        'Flex your glutes and drive your hips forward to initiate the ascent.',
        'Excellent for developing starting strength and posterior chain engagement.',
      ]
    },
    {
      name: 'Front Squat',
      sets: 3, reps: '5', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Quads, Thoracic Extension, Core',
      cues: [
        'Keep the bar racked on the front delts with elbows high throughout.',
        'If wrist mobility is limited, use a cross-arm grip.',
        'Torso must stay vertical — any forward lean will dump the bar.',
        'Front squats build serious quad strength and expose any core weaknesses.',
      ]
    },
    {
      name: 'Safety Bar Squat',
      sets: 4, reps: '5', intensity: '70%', intensityType: 'pct',
      muscles: 'Upper Back, Quads, Spinal Erectors',
      cues: [
        'The forward lean of the SSB loads the upper back heavily — embrace it.',
        'Focus on keeping your chest up and driving elbows down.',
        'Great for lifters with shoulder or wrist mobility limitations.',
        'Expect the load to feel heavier than a straight bar at the same weight.',
      ]
    },
    {
      name: 'Romanian Deadlift (RDL)',
      sets: 3, reps: '8', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Hamstrings, Glutes, Spinal Erectors',
      cues: [
        'Push hips back as the bar descends — not a squat, but a hip hinge.',
        'Bar should stay in contact with your legs the entire descent.',
        'Feel the stretch in your hamstrings before reversing.',
        'These load the hamstrings isometrically which supports squat depth and stability.',
      ]
    },
    {
      name: 'Leg Press',
      sets: 3, reps: '10–12', intensity: 'Light–Moderate', intensityType: 'light',
      muscles: 'Quads, Glutes (foot position dependent)',
      cues: [
        'High foot position targets glutes and hamstrings; low foot position targets quads.',
        'Full range of motion — bring knees to 90° or below.',
        'Avoid locking knees at the top to maintain constant tension.',
        'Use this as volume work after your primary squat sets.',
      ]
    },
    {
      name: 'Goblet Squat',
      sets: 3, reps: '10', intensity: 'Light–Moderate', intensityType: 'light',
      muscles: 'Quads, Core, Thoracic Mobility',
      cues: [
        'Hold a dumbbell or kettlebell at chest height.',
        'Excellent for warming up and drilling squat mechanics.',
        'Elbows should stay inside your knees at the bottom.',
        'Pause for 2 seconds at the bottom to build positional awareness.',
      ]
    },
  ],
  bench: [
    {
      name: 'Close-Grip Bench Press',
      sets: 4, reps: '5', intensity: '70–75%', intensityType: 'pct',
      muscles: 'Triceps, Anterior Deltoids, Chest',
      cues: [
        'Grip width: index fingers on the smooth ring of the knurling.',
        'Tuck elbows more aggressively than competition grip.',
        'Excellent for overloading the triceps in a competition-specific pattern.',
        "Don't go too narrow — shoulder width or slightly inside shoulder is ideal.",
      ]
    },
    {
      name: 'Dumbbell Bench Press',
      sets: 3, reps: '8–10', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Pectorals, Anterior Deltoids, Triceps',
      cues: [
        'Greater range of motion than barbell — take advantage of the stretch.',
        'Control the descent. The stretch under load is where chest growth happens.',
        "Keep wrists neutral — don't let them flare out.",
        'Allow a natural, slight decline at the bottom (dumbbells at 45°).',
      ]
    },
    {
      name: 'Incline Bench Press',
      sets: 4, reps: '6', intensity: 'RPE 7–8', intensityType: 'rpe',
      muscles: 'Upper Chest, Anterior Deltoids',
      cues: [
        'Set incline to 30–45°. Too steep becomes a shoulder press.',
        'Helps address upper chest weakness which often limits lockout pressing strength.',
        'Keep shoulder blades retracted even on the incline.',
        'Grip slightly wider than close-grip, similar to competition width.',
      ]
    },
    {
      name: 'Tricep Pushdown',
      sets: 4, reps: '12–15', intensity: 'Light–Moderate', intensityType: 'light',
      muscles: 'Triceps (all three heads)',
      cues: [
        'Full elbow extension at the bottom — squeeze hard.',
        'Keep upper arms pinned to your sides throughout the movement.',
        'Rope attachment allows for external rotation at the bottom for better contraction.',
        'High-rep tricep work builds lockout strength and hypertrophy.',
      ]
    },
    {
      name: 'Floor Press',
      sets: 4, reps: '5', intensity: '75%', intensityType: 'pct',
      muscles: 'Triceps, Chest (shortened ROM)',
      cues: [
        'Lie on the floor with knees bent at 45°.',
        'Eliminates leg drive and the bottom portion of the range of motion.',
        'Great for building lockout strength and identifying tricep weakness.',
        'Pause with elbows on the floor for a dead-stop version.',
      ]
    },
    {
      name: 'JM Press',
      sets: 3, reps: '8', intensity: 'Light–Moderate', intensityType: 'light',
      muscles: 'Triceps, Elbows',
      cues: [
        'A hybrid between a close-grip bench and a skull crusher.',
        'Lower the bar toward the chin/throat while elbows stay relatively tucked.',
        'Developed by JM Blakley — one of the most effective raw tricep exercises.',
        'Start light. This requires good elbow health to perform.',
      ]
    },
    {
      name: 'Overhead Press',
      sets: 3, reps: '8', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Deltoids, Triceps, Upper Chest',
      cues: [
        'Press from the front rack position. Full extension overhead.',
        "Brace your core as if you're about to be punched — no excessive lumbar arch.",
        'Strong delts and overhead pressing ability carry over to bench stability.',
        'Use a slightly narrower grip than your bench press grip.',
      ]
    },
  ],
  deadlift: [
    {
      name: 'Romanian Deadlift (RDL)',
      sets: 4, reps: '5', intensity: '65%', intensityType: 'pct',
      muscles: 'Hamstrings, Glutes, Spinal Erectors',
      cues: [
        'Load the hamstrings by pushing hips back until you feel a deep stretch.',
        'Bar stays close — near shin contact all the way down.',
        'Reverse by driving hips forward, not by pulling with your lower back.',
        'Slow eccentric (3–4 seconds down) maximizes hamstring stimulus.',
      ]
    },
    {
      name: 'Deficit Deadlift',
      sets: 4, reps: '3', intensity: 'RPE 7–8', intensityType: 'rpe',
      muscles: 'Quads, Glutes, Pull from Floor',
      cues: [
        'Stand on a 1–2 inch plate or platform.',
        'Increases range of motion, building strength off the floor.',
        'Maintain the same setup as your conventional/sumo — just deeper.',
        "Don't use too large a deficit. 1–2 inches is sufficient.",
      ]
    },
    {
      name: 'Block Pull / Rack Pull',
      sets: 4, reps: '3', intensity: '90–100%', intensityType: 'pct',
      muscles: 'Lockout, Traps, Spinal Erectors',
      cues: [
        'Set blocks or rack at just below knee height.',
        'Overloads the top end of the pull — great for lockout weakness.',
        'Squeeze the bar hard and drive hips through at the top.',
        'You can often handle 10–20% more than your full deadlift here.',
      ]
    },
    {
      name: 'Barbell Row',
      sets: 4, reps: '6–8', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Lats, Upper Back, Biceps',
      cues: [
        "Torso should be near parallel to the floor — don't cheat upright.",
        'Pull the bar to your lower abdomen, not your chest.',
        'A strong upper back is non-negotiable for deadlift lockout.',
        'Use a double overhand grip when possible for grip development.',
      ]
    },
    {
      name: 'Dumbbell Row',
      sets: 3, reps: '10', intensity: 'RPE 7', intensityType: 'rpe',
      muscles: 'Lats, Teres Major, Biceps',
      cues: [
        'Support yourself on a bench with the opposite hand and knee.',
        'Drive your elbow toward the ceiling — not just pulling the weight.',
        'Full stretch at the bottom, full contraction at the top.',
        'Unilateral training identifies and corrects lat imbalances.',
      ]
    },
    {
      name: 'Good Morning',
      sets: 3, reps: '8', intensity: 'Light', intensityType: 'light',
      muscles: 'Hamstrings, Glutes, Spinal Erectors',
      cues: [
        'Bar on the back, push hips back, maintain a neutral spine.',
        'This is a hip hinge movement — keep the lower back neutral, not rounded.',
        'One of the most effective posterior chain builders for deadlifters.',
        'Keep weights conservative — this is a supplementary movement.',
      ]
    },
    {
      name: 'Glute-Ham Raise (GHR)',
      sets: 3, reps: '8–10', intensity: 'Light–Moderate', intensityType: 'light',
      muscles: 'Hamstrings, Glutes, Calves',
      cues: [
        'One of the best hamstring exercises for powerlifters.',
        'Lower slowly with full knee extension at the bottom.',
        'Drive through the toes to activate calves as a synergist.',
        'Add band resistance or hold a plate when bodyweight becomes easy.',
      ]
    },
  ],
};

function ProgramCard({ ex, accentColor }: { ex: Exercise; accentColor: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const muscles = ex.muscles.split(', ');

  return (
    <div 
      className={`card-glow ${isOpen ? 'open' : ''}`} 
      style={{ padding: 1.5, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="card-inner" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.04em', color: 'var(--text)' }}>{ex.name}</span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em', 
                textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4,
                background: ex.intensityType === 'rpe' ? 'rgba(229,57,53,0.1)' : 
                            ex.intensityType === 'pct' ? 'rgba(255,171,0,0.1)' : 'rgba(0,191,165,0.1)',
                color: ex.intensityType === 'rpe' ? 'var(--red)' : 
                       ex.intensityType === 'pct' ? 'var(--amber)' : 'var(--teal)',
                border: `1px solid ${ex.intensityType === 'rpe' ? 'rgba(229,57,53,0.2)' : 
                                       ex.intensityType === 'pct' ? 'rgba(255,171,0,0.2)' : 'rgba(0,191,165,0.2)'}`
              }}>
                {ex.intensity}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>{ex.sets} × {ex.reps}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {muscles.map(m => (
                  <span key={m} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} color="var(--text-3)" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ height: 1, background: 'var(--border)', margin: '1.25rem 0' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: accentColor, marginBottom: '0.75rem' }}>COACHING CUES</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ex.cues.map((cue, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                    <span style={{ color: accentColor, flexShrink: 0, marginTop: 4 }}>▸</span>
                    <span style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.55 }}>{cue}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const sections = [
    { id: 'squat', title: 'SQUAT ACCESSORIES', color: 'var(--red)', label: 'Lift 01', exercises: PROGRAMS.squat },
    { id: 'bench', title: 'BENCH ACCESSORIES', color: 'var(--amber)', label: 'Lift 02', exercises: PROGRAMS.bench },
    { id: 'deadlift', title: 'DEADLIFT ACCESSORIES', color: 'var(--teal)', label: 'Lift 03', exercises: PROGRAMS.deadlift },
  ];

  return (
    <main>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Training</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,8vw,80px)', letterSpacing: '-0.01em', lineHeight: 0.92 }}>PROGRAMS</h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 560, fontSize: 17, marginTop: '1rem' }}>Accessory work for the big three. Seven exercises per lift — with sets, reps, intensity targets, and coaching cues.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1.25rem, 5vw, 2rem) 5rem' }}>
        {sections.map(section => (
          <section key={section.id} style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ width: 4, height: 48, background: section.color, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: section.color }}>{section.label}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: '0.04em', color: 'var(--text)' }}>{section.title}</h2>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {section.exercises.map(ex => (
                <ProgramCard key={ex.name} ex={ex} accentColor={section.color} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
