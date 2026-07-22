// app/components/games/kelas3/PecahanVisual.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function PecahanVisual({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'learn' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ numerator: 1, denominator: 4, opts: [] as string[] });
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const fractions = [
    { n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 },
    { n: 1, d: 4 }, { n: 2, d: 4 }, { n: 3, d: 4 },
    { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
  ];

  const generate = () => {
    const f = fractions[Math.floor(Math.random() * fractions.length)];
    const correctStr = `${f.n}/${f.d}`;
    const wrongs = new Set<string>();
    while (wrongs.size < 3) {
      const wn = Math.floor(Math.random() * f.d) + 1;
      const ws = `${wn}/${f.d}`;
      if (ws !== correctStr) wrongs.add(ws);
    }
    setQ({ numerator: f.n, denominator: f.d, opts: [...wrongs, correctStr].sort(() => Math.random() - 0.5) });
  };

  const renderFraction = (n: number, d: number) => {
    const total = d;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: '50px', height: '50px', borderRadius: '10px',
            background: i < n ? '#7c3aed' : theme.border,
            border: `2px solid ${i < n ? '#5b21b6' : theme.border}`,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    );
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === `${q.numerator}/${q.denominator}`;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🍕</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Pecahan Visual!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar pecahan dengan gambar seru! 🎨</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '16px' }}>Berapa pecahan yang diarsir?</h3>
        {renderFraction(q.numerator, q.denominator)}
        <p style={{ fontSize: '14px', color: theme.textMuted }}>
          {q.numerator} dari {q.denominator} bagian berwarna ungu
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '22px', fontWeight: '900', borderRadius: '14px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === `${q.numerator}/${q.denominator}` ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === `${q.numerator}/${q.denominator}`) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ ${q.numerator}/${q.denominator}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Pecahan!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}