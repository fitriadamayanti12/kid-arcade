// app/components/games/paud/HitungHewan.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const ANIMALS = [
  { emoji: '🐶', name: 'Anjing' },
  { emoji: '🐱', name: 'Kucing' },
  { emoji: '🐭', name: 'Tikus' },
  { emoji: '🐹', name: 'Hamster' },
  { emoji: '🐰', name: 'Kelinci' },
  { emoji: '🐮', name: 'Sapi' },
  { emoji: '🐷', name: 'Babi' },
  { emoji: '🐸', name: 'Katak' },
  { emoji: '🐵', name: 'Monyet' },
  { emoji: '🐔', name: 'Ayam' },
];

function generateQuestion() {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const w = Math.floor(Math.random() * 5) + 1;
    if (w !== count) wrongOptions.add(w);
  }
  const options = [...wrongOptions, count].sort(() => Math.random() - 0.5);
  return { count, animal, options };
}

export default function HitungHewan({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const handleAnswer = (answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    const isCorrect = answer === q.count;
    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

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
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🐮</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Hitung Hewan!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Hitung ada berapa hewan lucu! 🐾</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '40px' }}>
        {ANIMALS.map((a, i) => <span key={i} style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }} title={a.name}>{a.emoji}</span>)}
      </div>
      <button onClick={() => setStep('play')} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
        🎮 Mulai Bermain!
      </button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>Benar: {score}</span>
        {streak >= 3 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>🔥 {streak}x</span>}
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', fontWeight: '700', color: theme.heading, marginBottom: '16px' }}>
          {q.animal.name} {q.animal.emoji}
        </div>
        <div style={{ fontSize: '60px', letterSpacing: '8px', marginBottom: '20px', lineHeight: 1.4 }}>
          {Array.from({ length: q.count }).map((_, i) => (
            <span key={i} style={{ animation: `pop 0.5s ease-out ${i * 0.1}s both` }}>{q.animal.emoji}</span>
          ))}
        </div>
        <h3 style={{ fontSize: '22px', color: theme.heading }}>Ada berapa {q.animal.name}?</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.count ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.count) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
              transform: selected === opt ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! Ada ${q.count} ${q.animal.name}` : `❌ Ada ${q.count} ${q.animal.name}`}
        </div>
      )}
    </div>
  );

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Keren!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px', color: theme.textSecondary }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px', marginTop: '12px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim Hadiah!</button>
    </div>
  );
}