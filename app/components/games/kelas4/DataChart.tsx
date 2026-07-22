// app/components/games/kelas4/DataChart.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function DataChart({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ data: [] as number[], question: '', answer: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const data = Array.from({ length: 5 }, () => Math.floor(Math.random() * 8) + 2); // 2-9
    const maxIdx = data.indexOf(Math.max(...data));
    const totalSum = data.reduce((a, b) => a + b, 0);
    
    const questions = [
      { text: `Buah apa yang paling banyak?`, answer: maxIdx },
      { text: `Berapa jumlah semua buah?`, answer: totalSum },
      { text: `Berapa selisih buah terbanyak dan tersedikit?`, answer: Math.max(...data) - Math.min(...data) },
    ];
    const qs = questions[Math.floor(Math.random() * questions.length)];
    
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = qs.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      if (w !== qs.answer && w >= 0) wrongs.add(w);
    }
    setQ({ data, question: qs.text, answer: qs.answer, opts: [...wrongs, qs.answer].sort(() => Math.random() - 0.5) });
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

  const maxVal = Math.max(...q.data, 1);
  const barHeight = (val: number) => (val / maxVal) * 150;

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>📊</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Diagram Data!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar membaca diagram batang! 📈</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '24px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', height: '200px', paddingTop: '20px' }}>
          {q.data.map((val, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>{val}</span>
              <div style={{
                width: '40px', height: `${barHeight(val)}px`,
                background: COLORS[i], borderRadius: '8px 8px 0 0',
                transition: 'height 0.5s ease',
              }} />
              <span style={{ fontSize: '20px' }}>{FRUITS[i]}</span>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.heading, marginTop: '12px' }}>{q.question}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => {
          const label = q.question.includes('Buah apa') ? FRUITS[opt] || opt : opt;
          return (
            <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
              style={{
                padding: '14px', fontSize: '18px', fontWeight: '700', borderRadius: '14px', border: 'none',
                background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.answer ? '#10b981' : theme.bgHover,
                color: (selected === opt || (selected !== null && opt === q.answer)) ? '#fff' : theme.text,
                cursor: selected !== null ? 'default' : 'pointer',
              }}
            >{label}</button>
          );
        })}
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
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Data!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}