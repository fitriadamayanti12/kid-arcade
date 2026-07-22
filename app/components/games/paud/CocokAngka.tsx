// app/components/games/paud/CocokAngka.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const EMOJIS = ['⭐', '🌟', '💛', '🎈', '🌸', '🍎', '🐤', '💎'];

function generateQuestion() {
  const count = Math.floor(Math.random() * 5) + 1;
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const wrongNumbers = new Set<number>();
  while (wrongNumbers.size < 3) {
    const w = Math.floor(Math.random() * 5) + 1;
    if (w !== count) wrongNumbers.add(w);
  }
  const options = [...wrongNumbers, count].sort(() => Math.random() - 0.5);
  return { count, emoji, options };
}

export default function CocokAngka({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    setShowFeedback(true);
    const isCorrect = answer === q.count;
    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (total < 9) {
        setQ(generateQuestion());
        setSelected(null);
        setShowFeedback(false);
      } else {
        setStep('complete');
      }
    }, 1200);
  };

  const handleComplete = () => {
    const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
    onComplete(stars, { score, total });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎯</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Cocok Angka!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Cocokkan jumlah benda dengan angkanya! 🔢</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '40px', marginBottom: '24px' }}>
        {['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].map((n, i) => (
          <span key={i} style={{ animation: `float ${1.5 + i * 0.2}s ease-in-out infinite` }}>{n}</span>
        ))}
      </div>
      <button onClick={() => setStep('play')} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#ec4899', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}>
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
        <div style={{ fontSize: '50px', letterSpacing: '10px', marginBottom: '16px', lineHeight: 1.6 }}>
          {Array.from({ length: q.count }).map((_, i) => (
            <span key={i} style={{ animation: `pop 0.4s ease-out ${i * 0.1}s both` }}>{q.emoji}</span>
          ))}
        </div>
        <h3 style={{ fontSize: '20px', color: theme.heading }}>Ada berapa {q.emoji} di atas?</h3>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
            style={{
              width: '60px', height: '60px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.count ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.count) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
              transform: selected === opt ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>
      {showFeedback && (
        <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! ${q.count} ${q.emoji}` : `❌ Ada ${q.count} ${q.emoji}`}
        </div>
      )}
    </div>
  );

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Selesai!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: {score}/10</p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}