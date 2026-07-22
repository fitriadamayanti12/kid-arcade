// app/components/games/tk/TambahSederhana.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓'];

export default function TambahSederhana({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ a: 0, b: 0, fruitA: '🍎', fruitB: '🍊', opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const generate = () => {
    const a = Math.floor(Math.random() * 5) + 1; // 1-5
    const b = Math.floor(Math.random() * 5) + 1; // 1-5
    const ans = a + b;
    const fruitA = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    let fruitB = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    while (fruitB === fruitA) fruitB = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (w !== ans && w > 0 && w <= 10) wrongs.add(w);
    }
    setQ({ a, b, fruitA, fruitB, opts: [...wrongs, ans].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); setStreak(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.a + q.b;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else setStreak(0);
    setTimeout(() => {
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>➕</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Tambah Asyik!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar penjumlahan 1-10 dengan buah-buahan lucu! 🍎🍊</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '50px', marginBottom: '24px' }}>
        <span>🍎🍎 + 🍊🍊🍊 = ?</span>
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>🎮 Mulai Belajar!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
        {streak >= 3 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>🔥 {streak}x</span>}
      </div>
      
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${((total) / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        {/* Visual buah */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '40px', letterSpacing: '4px' }}>
            {Array.from({ length: q.a }).map((_, i) => <span key={i}>{q.fruitA}</span>)}
          </div>
          <span style={{ fontSize: '30px', fontWeight: '900', color: theme.heading }}>+</span>
          <div style={{ fontSize: '40px', letterSpacing: '4px' }}>
            {Array.from({ length: q.b }).map((_, i) => <span key={i}>{q.fruitB}</span>)}
          </div>
        </div>

        {/* Angka */}
        <h3 style={{ fontSize: '32px', fontWeight: '900', color: theme.heading, marginBottom: '4px' }}>
          {q.a} + {q.b} = ?
        </h3>
        <p style={{ fontSize: '14px', color: theme.textMuted }}>
          Hitung semua buah di atas!
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.a + q.b ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.a + q.b) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
              transform: selected === opt ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! ${q.a}+${q.b}=${q.a + q.b}` : `❌ ${q.a}+${q.b}=${q.a + q.b}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Kerja Bagus!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={start} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>🔄 Coba Lagi</button>
        <button onClick={handleComplete} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    </div>
  );
}