// app/components/games/tk/PolaGambar.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const PATTERNS = [
  { sequence: ['🍎', '🍊', '🍎', '🍊', '🍎'], answer: '🍊', hint: 'ABAB' },
  { sequence: ['🐶', '🐱', '🐶', '🐱', '🐶'], answer: '🐱', hint: 'ABAB' },
  { sequence: ['⭐', '🌟', '⭐', '🌟', '⭐'], answer: '🌟', hint: 'ABAB' },
  { sequence: ['🔴', '🔵', '🔵', '🔴', '🔵'], answer: '🔵', hint: 'ABBAB' },
  { sequence: ['🐤', '🐤', '🐸', '🐤', '🐤'], answer: '🐸', hint: 'AABAA' },
  { sequence: ['🌳', '🌻', '🌳', '🌻', '🌳'], answer: '🌻', hint: 'ABAB' },
  { sequence: ['🍕', '🍕', '🍔', '🍕', '🍕'], answer: '🍔', hint: 'AABAA' },
  { sequence: ['🚗', '🚌', '🚗', '🚌', '🚗'], answer: '🚌', hint: 'ABAB' },
];

export default function PolaGambar({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const pattern = PATTERNS[index];
  const options = [pattern.answer, 
    pattern.sequence[0] === pattern.answer ? pattern.sequence[1] : pattern.sequence[0],
    pattern.sequence[2] || '🌟',
    pattern.sequence[3] || '🎈'
  ].slice(0, 3).sort(() => Math.random() - 0.5);

  const start = () => { setStep('play'); setScore(0); setTotal(0); setIndex(0); };

  const handle = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === pattern.answer;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (total < 7) { setIndex(i => i + 1); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🧩</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Pola Gambar!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Lanjutkan polanya! Gambar apa berikutnya? 🤔</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '40px', marginBottom: '24px' }}>
        <span>🍎</span><span>🍊</span><span>🍎</span><span>🍊</span><span style={{ color: '#f59e0b' }}>?</span>
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#ec4899', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/8</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '20px' }}>Lanjutkan polanya!</h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '45px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {pattern.sequence.map((item, i) => (
            <span key={i} style={{ animation: `pop 0.3s ease-out ${i * 0.1}s both` }}>{item}</span>
          ))}
          <span style={{ 
            fontSize: '45px', 
            color: '#f59e0b',
            animation: 'pulse 1s ease-in-out infinite',
            background: '#fef3c7',
            borderRadius: '12px',
            padding: '8px',
          }}>❓</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              width: '70px', height: '70px', fontSize: '40px', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === pattern.answer ? '#10b981' : theme.bgHover,
              cursor: selected !== null ? 'default' : 'pointer',
              transform: selected === opt ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar! Polanya tepat!' : `❌ Yang benar: ${pattern.answer} (${pattern.hint})`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jenius Pola!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/8</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={start} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={handleComplete} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    </div>
  );
}