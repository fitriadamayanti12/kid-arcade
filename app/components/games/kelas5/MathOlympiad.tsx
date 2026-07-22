// app/components/games/kelas5/MathOlympiad.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function MathOlympiad({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ text: '', answer: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  const generate = () => {
    const diff = Math.min(difficulty, 5);
    const types = [
      () => { const a = Math.floor(Math.random() * 50 * diff) + 10; const b = Math.floor(Math.random() * 30 * diff) + 5; return { text: `${a} + ${b} + ${Math.floor(Math.random() * 20)} = ?`, answer: a + b + Math.floor(Math.random() * 20) }; },
      () => { const a = Math.floor(Math.random() * 9 * diff) + 10; const b = Math.floor(Math.random() * 5 * diff) + 5; return { text: `${a} × ${b} - ${Math.floor(Math.random() * 20)} = ?`, answer: a * b - Math.floor(Math.random() * 20) }; },
      () => { const a = Math.floor(Math.random() * 20) + 10; const b = Math.floor(Math.random() * 10) + 2; const c = Math.floor(Math.random() * 5) + 1; return { text: `(${a} + ${b}) × ${c} = ?`, answer: (a + b) * c }; },
      () => { const n = Math.floor(Math.random() * 50) + 20; return { text: `Akar pangkat 2 dari ${n * n} = ?`, answer: n }; },
      () => { const p = Math.floor(Math.random() * 20) + 5; const l = Math.floor(Math.random() * 10) + 3; const t = Math.floor(Math.random() * 8) + 2; return { text: `Akuarium ${p}×${l}×${t} dm. Volume = ? liter`, answer: p * l * t }; },
    ];
    const gen = types[Math.floor(Math.random() * types.length)]();
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = gen.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);
      if (w !== gen.answer && w > 0) wrongs.add(w);
    }
    setQ({ text: gen.text, answer: gen.answer, opts: [...wrongs, gen.answer].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); setStreak(0); setDifficulty(1); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) { 
      setScore(s => s + 1); 
      setStreak(s => s + 1);
      if (streak + 1 >= 3) setDifficulty(d => Math.min(d + 1, 5));
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      if (total < 19) { generate(); setSelected(null); }
      else setStep('complete');
    }, 800);
  };

  const stars = score >= 16 ? 3 : score >= 12 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total, difficulty });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏆</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Math Olympiad!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Tantangan matematika level olimpiade! 🧠</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>🏆 Mulai Tantangan!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/20</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>Level {difficulty}</span>
        {streak >= 3 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>🔥 {streak}x</span>}
      </div>

      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px' }}>
        <div style={{ width: `${(total / 20) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '50px', marginBottom: '12px' }}>🧠</div>
        <h3 style={{ fontSize: '28px', fontWeight: '900', color: theme.heading }}>{q.text}</h3>
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
          {correct ? '🎉 Benar! Level UP!' : `❌ ${q.answer}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Olympiad Champion!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/20</strong></p>
        <p style={{ fontSize: '14px', color: theme.textMuted }}>Level: {difficulty} | Streak: {streak}x</p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}