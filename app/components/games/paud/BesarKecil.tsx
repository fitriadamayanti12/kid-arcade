// app/components/games/paud/BesarKecil.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const OBJECTS = ['🍎', '🏀', '🐘', '🏠', '🚗', '🐳', '🌳', '🎈', '🐜', '🫐'];

function generateQuestion() {
  const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  const size1 = Math.floor(Math.random() * 40) + 30; // 30-70px
  const size2 = Math.floor(Math.random() * 40) + 30;
  const different = Math.abs(size1 - size2) >= 15;
  if (!different) {
    return generateQuestion(); // Recursive sampai beda
  }
  const bigger = size1 > size2 ? 1 : 2;
  return { obj, size1, size2, bigger };
}

export default function BesarKecil({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAnswer = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    const isCorrect = choice === q.bigger;
    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (total < 9) {
        setQ(generateQuestion());
        setSelected(null);
      } else {
        setStep('complete');
      }
    }, 1000);
  };

  const handleComplete = () => {
    const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
    onComplete(stars, { score, total });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🐘</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Besar & Kecil!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Mana yang lebih besar? Yuk belajar perbandingan! 📏</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '50px', marginBottom: '24px' }}>
        <span style={{ animation: 'float 2s ease-in-out infinite' }}>🐜</span>
        <span style={{ fontSize: '30px', alignSelf: 'center' }}>vs</span>
        <span style={{ fontSize: '70px', animation: 'float 2.5s ease-in-out infinite' }}>🐘</span>
      </div>
      <button onClick={() => setStep('play')} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
        🎮 Mulai!
      </button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '22px', color: theme.heading, marginBottom: '20px' }}>Mana yang lebih BESAR?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
          <button
            onClick={() => handleAnswer(1)}
            disabled={selected !== null}
            style={{
              fontSize: `${q.size1}px`,
              padding: '20px',
              borderRadius: '20px',
              border: selected === 1 ? `3px solid ${correct ? '#10b981' : '#ef4444'}` : '3px solid transparent',
              background: selected === 1 ? (correct ? '#d1fae5' : '#fee2e2') : theme.bgHover,
              cursor: selected !== null ? 'default' : 'pointer',
              transition: 'all 0.2s',
              transform: selected === 1 ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {q.obj}
          </button>
          <button
            onClick={() => handleAnswer(2)}
            disabled={selected !== null}
            style={{
              fontSize: `${q.size2}px`,
              padding: '20px',
              borderRadius: '20px',
              border: selected === 2 ? `3px solid ${correct ? '#10b981' : '#ef4444'}` : '3px solid transparent',
              background: selected === 2 ? (correct ? '#d1fae5' : '#fee2e2') : theme.bgHover,
              cursor: selected !== null ? 'default' : 'pointer',
              transition: 'all 0.2s',
              transform: selected === 2 ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {q.obj}
          </button>
        </div>
      </div>
      {selected !== null && (
        <div style={{ padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar! Pintar!' : '❌ Coba lagi ya!'}
        </div>
      )}
    </div>
  );

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Kamu Hebat!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px', color: theme.textSecondary }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}