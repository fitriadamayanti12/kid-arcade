// app/components/games/PizzaFraction.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface PizzaFractionProps {
  onComplete: (stars: number, extra?: any) => void;
}

export default function PizzaFraction({ onComplete }: PizzaFractionProps) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);

  const questions = [
    { q: '3/4 = ... dari 4 bagian', opts: ['1', '2', '3', '4'], ans: '3', exp: '3 dari 4 bagian = 3/4' },
    { q: '1/2 + 1/2 = ?', opts: ['1/4', '2/4', '3/4', '4/4'], ans: '4/4', exp: '1/2 + 1/2 = 4/4 = 1' },
    { q: '2/4 ... 1/2', opts: ['>', '<', '='], ans: '=', exp: '2/4 = 1/2' },
    { q: 'Pecahan senilai 1/2?', opts: ['1/4', '2/4', '3/4', '1/3'], ans: '2/4', exp: '1/2 = 2/4 (×2)' },
    { q: '1/4 + 2/4 = ?', opts: ['1/4', '2/4', '3/4', '4/4'], ans: '3/4', exp: '1+2=3, penyebut tetap 4' },
  ];

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const handle = (ans: string) => {
    if (feedback) return;
    setSelected(ans);
    const ok = ans === questions[current].ans;
    setCorrect(ok); setFeedback(true);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (current < questions.length - 1) { setCurrent(c => c + 1); setSelected(null); setFeedback(false); }
      else { const f = score + (ok ? 1 : 0); setDone(true); onComplete(f >= 5 ? 3 : f >= 3 ? 2 : 1, { score: f, total: questions.length }); }
    }, 1500);
  };

  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: theme.bg }}>
      <div style={{ fontSize: '60px', animation: 'float 1s ease-in-out infinite' }}>🍕</div>
    </div>
  );

  if (done) {
    const stars = score >= 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🎉🍕</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Skor: {score}/{questions.length}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <span style={{ color: theme.textSecondary }}>Soal {current + 1}/{questions.length}</span>
        <span style={{ color: '#10b981', fontWeight: '700' }}>Benar: {score}</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '16px' }}>
        <div style={{ width: `${(current / questions.length) * 100}%`, height: '100%', background: '#f97316', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: '#fffbeb', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ fontSize: '60px', marginBottom: '12px' }}>🍕</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>{q.q}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={feedback} style={{
            padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '12px', border: 'none',
            background: feedback && opt === q.ans ? '#10b981' : feedback && opt === selected ? '#ef4444' : theme.bgHover,
            color: (feedback && (opt === q.ans || opt === selected)) ? '#fff' : theme.text,
            cursor: feedback ? 'default' : 'pointer',
          }}>{opt}</button>
        ))}
      </div>

      {feedback && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '600', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ ${q.exp}`}
        </div>
      )}
    </div>
  );
}