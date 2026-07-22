// app/components/games/kelas1/PanjangPendek.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function PanjangPendek({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ a: 0, b: 0, question: '', answer: '' });
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const a = Math.floor(Math.random() * 15) + 3; // 3-17 cm
    const b = Math.floor(Math.random() * 15) + 3;
    if (a === b) return generate();
    const question = Math.random() > 0.5 ? 'Mana yang lebih PANJANG?' : 'Mana yang lebih PENDEK?';
    const longer = a > b ? 'A' : 'B';
    const answer = question.includes('PANJANG') ? longer : (longer === 'A' ? 'B' : 'A');
    setQ({ a, b, question, answer });
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
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>📏</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Panjang Pendek!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Bandingkan panjang benda! 📐</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f97316', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.heading, marginBottom: '24px' }}>{q.question}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '30px', height: '180px' }}>
          <button onClick={() => handle('A')} disabled={selected !== null}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              background: selected === 'A' ? (correct ? '#d1fae5' : '#fee2e2') : 'transparent',
              borderRadius: '16px', padding: '12px', border: 'none', cursor: selected !== null ? 'default' : 'pointer',
            }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>A</span>
            <div style={{
              width: '30px', height: `${q.a * 8}px`,
              background: 'linear-gradient(180deg, #3b82f6, #60a5fa)',
              borderRadius: '6px', transition: 'all 0.3s',
            }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>{q.a} cm</span>
          </button>

          <button onClick={() => handle('B')} disabled={selected !== null}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              background: selected === 'B' ? (correct ? '#d1fae5' : '#fee2e2') : 'transparent',
              borderRadius: '16px', padding: '12px', border: 'none', cursor: selected !== null ? 'default' : 'pointer',
            }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>B</span>
            <div style={{
              width: '30px', height: `${q.b * 8}px`,
              background: 'linear-gradient(180deg, #ef4444, #f87171)',
              borderRadius: '6px', transition: 'all 0.3s',
            }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>{q.b} cm</span>
          </button>
        </div>
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ Yang benar: ${q.answer}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Ukur!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}