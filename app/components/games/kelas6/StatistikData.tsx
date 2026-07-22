// app/components/games/kelas6/StatistikData.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function StatistikData({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ data: [] as number[], text: '', answer: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const n = Math.floor(Math.random() * 4) + 5; // 5-8 data
    const data = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 5);
    const sorted = [...data].sort((a, b) => a - b);
    const mean = Math.round(data.reduce((a, b) => a + b, 0) / n);
    const median = n % 2 === 1 ? sorted[Math.floor(n / 2)] : Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
    
    const freq: Record<number, number> = {};
    data.forEach(d => freq[d] = (freq[d] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, v]) => v === maxFreq).map(([k]) => parseInt(k));
    const modus = modes.length === 1 ? modes[0] : modes[0];

    const types = [
      { text: 'Mean (rata-rata) = ?', answer: mean },
      { text: 'Median (nilai tengah) = ?', answer: median },
      { text: 'Modus (paling sering) = ?', answer: modus },
    ];
    const qs = types[Math.floor(Math.random() * types.length)];
    
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = qs.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      if (w !== qs.answer) wrongs.add(w);
    }
    setQ({ data, text: qs.text, answer: qs.answer, opts: [...wrongs, qs.answer].sort(() => Math.random() - 0.5) });
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
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>📊</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Statistik!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Mean, Median, Modus data tunggal! 📈</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#ec4899', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '24px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {q.data.map((d, i) => (
            <span key={i} style={{
              padding: '8px 14px', background: COLORS[i % COLORS.length] + '20',
              borderRadius: '10px', fontWeight: '700', fontSize: '18px',
              color: COLORS[i % COLORS.length],
            }}>{d}</span>
          ))}
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: '900', color: theme.heading }}>{q.text}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '18px', fontWeight: '700', borderRadius: '14px', border: 'none',
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
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Ahli Statistik!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];