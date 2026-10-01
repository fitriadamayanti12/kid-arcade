// app/components/games/kelas3/TembakJawaban.tsx
// 🎯 Tembak Jawaban — soal muncul, 6 balon jawaban tersebar & waktunya sempit.
// Nembak cuma butuh 1 ketuk & mata jeli, cocok buat anak yang malas mikir panjang.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const TOTAL = 12;
const TIME_PER_Q = 4000; // ms
// posisi tetap untuk 6 balon (persen dari kotak arena) — hanya ISI-nya yang diacak tiap ronde
const SLOTS = [
  { top: '10%', left: '12%' }, { top: '6%', left: '58%' }, { top: '38%', left: '2%' },
  { top: '34%', left: '68%' }, { top: '66%', left: '20%' }, { top: '68%', left: '52%' },
];

function makeFact() {
  const a = randInt(2, 10);
  const b = randInt(2, 10);
  const answer = a * b;
  return { prompt: `${a} × ${b} = ?`, answer, options: shuffleArr(numericOptions(answer, 12, 6)) };
}

export default function TembakJawaban({ onComplete }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const [round, setRound] = useState(0);
  const [fact, setFact] = useState(() => makeFact());
  const [correct, setCorrect] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hitIdx, setHitIdx] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);
  const [pct, setPct] = useState(100);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  const finishedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const deadlineRef = useRef(0);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
  };

  useEffect(() => clearTimers, []);

  const tick = () => {
    const left = deadlineRef.current - Date.now();
    setPct(Math.max(0, (left / TIME_PER_Q) * 100));
    if (left <= 0) {
      handleTimeout();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startRound = (r: number) => {
    setFact(makeFact());
    setHitIdx(null);
    setMissed(false);
    setLocked(false);
    deadlineRef.current = Date.now() + TIME_PER_Q;
    setPct(100);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (finalCorrect: number, finalBest: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    const stars = finalCorrect >= 10 ? 3 : finalCorrect >= 7 ? 2 : 1;
    setDone(true);
    playSound(stars === 3 ? 'win' : 'reward');
    setTimeout(() => onComplete(stars, { score: finalCorrect, streak: finalBest, total: TOTAL }), 1200);
  };

  const goNext = (newCorrect: number, newBest: number) => {
    if (round >= TOTAL - 1) {
      finish(newCorrect, newBest);
    } else {
      setRound((r) => r + 1);
      startRound(round + 1);
    }
  };

  const handleTimeout = () => {
    if (locked) return;
    setLocked(true);
    setMissed(true);
    playSound('wrong');
    setStreak(0);
    advanceRef.current = setTimeout(() => goNext(correct, bestStreak), 700);
  };

  const shoot = (idx: number, value: number) => {
    if (locked || done) return;
    setLocked(true);
    clearTimers();
    const ok = value === fact.answer;
    setHitIdx(idx);
    playSound(ok ? 'correct' : 'wrong');
    let newCorrect = correct;
    let newStreak = streak;
    let newBest = bestStreak;
    if (ok) {
      newCorrect = correct + 1;
      newStreak = streak + 1;
      newBest = Math.max(bestStreak, newStreak);
      setCorrect(newCorrect);
      setStreak(newStreak);
      setBestStreak(newBest);
    } else {
      setMissed(true);
      setStreak(0);
    }
    advanceRef.current = setTimeout(() => goNext(newCorrect, newBest), ok ? 450 : 800);
  };

  const card = { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '18px', boxShadow: theme.shadow } as const;

  if (done) {
    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ ...card, padding: '28px 18px' }}>
          <div style={{ fontSize: '44px' }}>🎯</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>Selesai!</h2>
          <p style={{ fontSize: '15px', color: theme.text }}>{correct} dari {TOTAL} kena sasaran</p>
          <p style={{ fontSize: '13px', color: theme.textMuted }}>🔥 Beruntun terbaik: {bestStreak}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, color: theme.heading, fontSize: '13px' }}>🎯 Tembak Jawaban</span>
        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13px' }}>Sasaran {round + 1}/{TOTAL}</span>
      </div>

      <div style={{ ...card, textAlign: 'center', padding: '14px', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 900, color: theme.heading, margin: 0 }}>{fact.prompt}</h3>
      </div>

      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: pct < 30 ? '#ef4444' : '#3b82f6' }} />
      </div>

      <div style={{ position: 'relative', height: '250px', background: theme.bgHover, borderRadius: '18px', overflow: 'hidden' }}>
        {fact.options.map((opt, i) => {
          const slot = SLOTS[i % SLOTS.length];
          const isHit = hitIdx === i;
          const isRightOne = missed && opt === fact.answer;
          return (
            <button
              key={`${round}-${i}`}
              onClick={() => shoot(i, opt)}
              disabled={locked}
              style={{
                position: 'absolute',
                top: slot.top,
                left: slot.left,
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                border: 'none',
                fontSize: '19px',
                fontWeight: 900,
                cursor: locked ? 'default' : 'pointer',
                background: isHit ? (opt === fact.answer ? '#10b981' : '#ef4444') : isRightOne ? '#10b981' : '#93c5fd',
                color: '#fff',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s, background 0.15s',
                transform: isHit ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {streak >= 3 && <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>🔥 Beruntun {streak}!</p>}
    </div>
  );
}
