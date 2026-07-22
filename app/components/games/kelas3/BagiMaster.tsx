// app/components/games/kelas3/BagiMaster.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function BagiMaster({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ dividend: 0, divisor: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const generate = () => {
    const divisor = Math.floor(Math.random() * 9) + 2; // 2-10
    const quotient = Math.floor(Math.random() * 9) + 2; // 2-10
    const dividend = divisor * quotient;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = quotient + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (w !== quotient && w > 0 && w <= 10) wrongs.add(w);
    }
    setQ({ dividend, divisor, opts: [...wrongs, quotient].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); setStreak(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.dividend / q.divisor;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else setStreak(0);
    setTimeout(() => {
      if (total < 19) { generate(); setSelected(null); }
      else setStep('complete');
    }, 800);
  };

  const stars = score >= 17 ? 3 : score >= 13 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total, streak });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>➗</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Bagi Master!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Kuasai pembagian dengan cepat! ⚡</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>⚡ Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/20</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
        {streak >= 5 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>🔥 {streak}x</span>}
      </div>

      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px' }}>
        <div style={{ width: `${(total / 20) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '50px', letterSpacing: '6px', marginBottom: '16px' }}>
          {Array.from({ length: q.dividend }).map((_, i) => <span key={i}>⭐</span>)}
        </div>
        <h3 style={{ fontSize: '42px', fontWeight: '900', color: theme.heading }}>
          {q.dividend} ÷ {q.divisor} = ?
        </h3>
        <p style={{ fontSize: '14px', color: theme.textMuted }}>Dibagi ke {q.divisor} kelompok</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '24px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.dividend / q.divisor ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.dividend / q.divisor) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 ${q.dividend}÷${q.divisor}=${q.dividend / q.divisor}` : `❌ ${q.dividend}÷${q.divisor}=${q.dividend / q.divisor}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Master Pembagian!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/20</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}