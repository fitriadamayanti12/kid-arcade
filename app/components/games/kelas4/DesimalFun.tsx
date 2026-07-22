// app/components/games/kelas4/DesimalFun.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function DesimalFun({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ text: '', answer: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const types = [
      // Pecahan ke desimal
      () => {
        const fractions = [
          { n: 1, d: 2, dec: 0.5 }, { n: 1, d: 4, dec: 0.25 }, { n: 3, d: 4, dec: 0.75 },
          { n: 1, d: 5, dec: 0.2 }, { n: 2, d: 5, dec: 0.4 }, { n: 3, d: 5, dec: 0.6 },
          { n: 4, d: 5, dec: 0.8 }, { n: 1, d: 10, dec: 0.1 }, { n: 3, d: 10, dec: 0.3 },
        ];
        const f = fractions[Math.floor(Math.random() * fractions.length)];
        return { text: `${f.n}/${f.d} = ... (desimal)`, answer: f.dec };
      },
      // Penjumlahan desimal
      () => {
        const a = Math.round((Math.random() * 5 + 0.5) * 10) / 10;
        const b = Math.round((Math.random() * 3 + 0.5) * 10) / 10;
        return { text: `${a} + ${b} = ?`, answer: Math.round((a + b) * 10) / 10 };
      },
      // Pengurangan desimal
      () => {
        const a = Math.round((Math.random() * 5 + 3) * 10) / 10;
        const b = Math.round((Math.random() * a * 10) / 10) / 10;
        return { text: `${a} - ${b} = ?`, answer: Math.round((a - b) * 10) / 10 };
      },
    ];
    const gen = types[Math.floor(Math.random() * types.length)]();
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = Math.round((gen.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.1)) * 10) / 10;
      if (w !== gen.answer && w > 0) wrongs.add(w);
    }
    setQ({ text: gen.text, answer: gen.answer, opts: [...wrongs, gen.answer].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (total < 14) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1000);
  };

  const stars = score >= 12 ? 3 : score >= 9 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔢</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Desimal Fun!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar bilangan desimal dengan mudah! 🎯</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#06b6d4', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6,182,212,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/15</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '34px', fontWeight: '900', color: theme.heading }}>{q.text}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '14px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.answer ? '#10b981' : theme.bgHover,
              color: (selected === opt || (selected !== null && opt === q.answer)) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ ${q.answer}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Desimal!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/15</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}