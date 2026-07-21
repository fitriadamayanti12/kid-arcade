'use client';

import { useState, useEffect } from 'react';

interface PizzaFractionProps {
  onComplete: (stars: number, extra?: any) => void;
}

export default function PizzaFraction({ onComplete }: PizzaFractionProps) {
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);

  const questions = [
    { q: '3/4 = ... dari 4 bagian', opts: ['1', '2', '3', '4'], ans: '3', exp: '3 dari 4 bagian = 3/4' },
    { q: '1/2 + 1/2 = ?', opts: ['1/4', '2/4', '3/4', '4/4'], ans: '4/4', exp: '1/2 + 1/2 = 2/2 = 4/4 = 1' },
    { q: '2/4 ... 1/2', opts: ['>', '<', '='], ans: '=', exp: '2/4 disederhanakan = 1/2' },
    { q: 'Pecahan senilai 1/2?', opts: ['1/4', '2/4', '3/4', '1/3'], ans: '2/4', exp: '1/2 = 2/4 (×2)' },
    { q: '1/4 + 2/4 = ?', opts: ['1/4', '2/4', '3/4', '4/4'], ans: '3/4', exp: '1+2=3, penyebut tetap 4' },
  ];

  useEffect(() => {
    console.log('PizzaFraction mounted');
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handle = (ans: string) => {
    if (feedback) return;
    setSelected(ans);
    const ok = ans === questions[current].ans;
    setCorrect(ok);
    setFeedback(true);
    if (ok) setScore(s => s + 1);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedback(false);
      } else {
        const final = score + (ok ? 1 : 0);
        const stars = final >= 5 ? 3 : final >= 3 ? 2 : 1;
        setDone(true);
        onComplete(stars, { score: final, total: questions.length });
      }
    }, 1500);
  };

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '60px' }}>🍕</div>
        <p style={{ color: '#666', fontSize: '18px' }}>Menyiapkan Pizza...</p>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (done) {
    const stars = score >= 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '60px' }}>🎉🍕</div>
        <h2 style={{ fontSize: '24px', color: '#EA580C' }}>Selesai!</h2>
        <p style={{ fontSize: '18px' }}>Skor: {score}/{questions.length}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: '#666' }}>Soal {current + 1}/{questions.length}</span>
        <span style={{ color: '#16A34A', fontWeight: 'bold' }}>Benar: {score}</span>
      </div>

      <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '24px' }}>
        <div style={{ width: `${(current / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(to right, #FB923C, #EF4444)', borderRadius: '4px', transition: 'width 0.5s' }} />
      </div>

      <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🍕</div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{q.q}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handle(opt)}
            disabled={feedback}
            style={{
              padding: '16px',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '2px solid #D1D5DB',
              background: feedback && opt === q.ans ? '#22C55E' :
                         feedback && opt === selected ? '#EF4444' : 'white',
              color: feedback && (opt === q.ans || opt === selected) ? 'white' : '#1F2937',
              cursor: feedback ? 'default' : 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div style={{ padding: '16px', borderRadius: '12px', background: correct ? '#F0FDF4' : '#FEF2F2', border: `2px solid ${correct ? '#86EFAC' : '#FCA5A5'}` }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: correct ? '#16A34A' : '#DC2626', marginBottom: '8px' }}>
            {correct ? '🎉 Benar!' : '❌ Belum tepat'}
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>{q.exp}</p>
        </div>
      )}
    </div>
  );
}