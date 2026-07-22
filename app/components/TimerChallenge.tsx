// app/components/TimerChallenge.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface TimerChallengeProps {
  onComplete: (stars: number, extra?: any) => void;
}

export default function TimerChallenge({ onComplete }: TimerChallengeProps) {
  const theme = useThemeStyles();
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [q, setQ] = useState({ a: 0, b: 0, op: '+', answer: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const { playSound } = useSoundEffect();

  // Timer
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      setIsActive(false);
      const stars = score >= 15 ? 3 : score >= 10 ? 2 : 1;
      onComplete(stars, { score, total, streak });
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isActive]);

  const generate = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;

    switch (op) {
      case '+': a = Math.floor(Math.random() * 30) + 5; b = Math.floor(Math.random() * 30) + 5; answer = a + b; break;
      case '-': a = Math.floor(Math.random() * 40) + 10; b = Math.floor(Math.random() * a) + 1; answer = a - b; break;
      case '×': a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b; break;
      default: a = 0; b = 0; answer = 0;
    }

    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 1);
      if (w !== answer && w >= 0) wrongs.add(w);
    }
    setQ({ a, b, op, answer, opts: [...wrongs, answer].sort(() => Math.random() - 0.5) });
  };

  useEffect(() => { generate(); }, []);

  const handleAnswer = (ans: number) => {
    if (!isActive || selected !== null) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) { 
      setScore(s => s + 1); 
      setStreak(s => s + 1);
      setTimeLeft(t => t + 3); // Bonus waktu!
      playSound('win');
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 2)); // Penalti!
      playSound('click');
    }
    setTimeout(() => {
      if (isActive) { generate(); setSelected(null); }
    }, 500);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      {/* Timer */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '48px', fontWeight: '900',
          color: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#3b82f6',
          animation: timeLeft <= 10 ? 'pulse 1s ease-in-out infinite' : 'none',
        }}>
          ⏱️ {timeLeft}s
        </div>
        <div style={{ 
          width: '100%', height: '6px', background: theme.border, borderRadius: '3px',
          marginTop: '8px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(timeLeft / 30) * 100}%`, height: '100%',
            background: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#3b82f6',
            borderRadius: '3px', transition: 'width 1s',
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
        <span style={{ color: theme.textSecondary }}>Skor: <strong style={{ color: '#10b981' }}>{score}</strong></span>
        <span style={{ color: theme.textSecondary }}>Total: {total}</span>
        {streak >= 3 && <span style={{ color: '#f59e0b', fontWeight: '700' }}>🔥 {streak}x</span>}
      </div>

      {/* Question */}
      {isActive && (
        <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '24px', boxShadow: theme.shadow, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: theme.heading }}>
            {q.a} {q.op} {q.b} = ?
          </h3>
        </div>
      )}

      {/* Options */}
      {isActive && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
          {q.opts.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
              style={{
                padding: '14px', fontSize: '22px', fontWeight: '700', borderRadius: '14px', border: 'none',
                background: selected === opt ? (correct ? '#10b981' : '#ef4444') : theme.bgHover,
                color: selected === opt ? '#fff' : theme.text,
                cursor: selected !== null ? 'default' : 'pointer',
              }}
            >{opt}</button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {selected !== null && (
        <div style={{
          marginTop: '12px', padding: '10px', borderRadius: '10px',
          background: correct ? '#d1fae5' : '#fee2e2',
          color: correct ? '#065f46' : '#991b1b',
          fontWeight: '700', fontSize: '16px',
          animation: 'pop 0.3s ease-out',
        }}>
          {correct ? `🎉 +3 detik! ${q.a}${q.op}${q.b}=${q.answer}` : `❌ -2 detik! ${q.answer}`}
        </div>
      )}

      {/* Game Over */}
      {!isActive && (
        <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '24px', boxShadow: theme.shadow }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>⏰</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.heading }}>Waktu Habis!</h3>
          <p style={{ fontSize: '16px', color: theme.textSecondary }}>
            Skor: <strong>{score}</strong> | Total: {total}
          </p>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>
            ⭐ {score >= 15 ? '★★★' : score >= 10 ? '★★' : '★'}
          </p>
        </div>
      )}
    </div>
  );
}