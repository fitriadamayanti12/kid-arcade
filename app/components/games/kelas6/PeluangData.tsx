// app/components/games/kelas6/PeluangData.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function PeluangData({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ text: '', answer: '', opts: [] as string[] });
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const types = [
      () => {
        const n = Math.floor(Math.random() * 5) + 2;
        return { text: `Dadu dilempar sekali. Peluang muncul angka ${n}?`, answer: `1/6` };
      },
      () => {
        const ganjil = Math.random() > 0.5;
        return { text: `Dadu dilempar sekali. Peluang muncul ${ganjil ? 'ganjil' : 'genap'}?`, answer: `3/6` };
      },
      () => {
        const n = Math.floor(Math.random() * 4) + 2;
        return { text: `Dadu dilempar sekali. Peluang muncul mata dadu < ${n}?`, answer: `${n-1}/6` };
      },
      () => {
        const coins = Math.floor(Math.random() * 3) + 1;
        const heads = Math.floor(Math.random() * coins) + 1;
        return { text: `${coins} koin dilempar. Peluang ${heads} gambar?`, answer: `${heads}/${coins * 2}` };
      },
    ];
    const gen = types[Math.floor(Math.random() * types.length)]();
    const wrongs = new Set(['1/2', '2/6', '4/6', '1/3'].filter(w => w !== gen.answer).slice(0, 3));
    setQ({ text: gen.text, answer: gen.answer, opts: [...wrongs, gen.answer].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: string) => {
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
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎲</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Peluang!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Hitung peluang kejadian! 🎯</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '50px', marginBottom: '24px' }}>
        {DICE_FACES.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/15</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎲</div>
        <h3 style={{ fontSize: '24px', fontWeight: '900', color: theme.heading }}>{q.text}</h3>
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
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Peluang!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/15</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}