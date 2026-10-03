// app/components/games/paud/KenalAngka.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const NUMBERS = [
  { n: 1, emoji: '☝️', dots: '⚫', objects: '🐤' },
  { n: 2, emoji: '✌️', dots: '⚫⚫', objects: '🐤🐤' },
  { n: 3, emoji: '🤟', dots: '⚫⚫⚫', objects: '🐤🐤🐤' },
  { n: 4, emoji: '🖖', dots: '⚫⚫⚫⚫', objects: '🐤🐤🐤🐤' },
  { n: 5, emoji: '🖐️', dots: '⚫⚫⚫⚫⚫', objects: '🐤🐤🐤🐤🐤' },
  { n: 6, emoji: '🤙', dots: '⚫⚫⚫⚫⚫⚫', objects: '🐤🐤🐤🐤🐤🐤' },
  { n: 7, emoji: '✋', dots: '⚫⚫⚫⚫⚫⚫⚫', objects: '🐤🐤🐤🐤🐤🐤🐤' },
  { n: 8, emoji: '🖐️✌️', dots: '⚫×8', objects: '🐤×8' },
  { n: 9, emoji: '🖐️🖖', dots: '⚫×9', objects: '🐤×9' },
  { n: 10, emoji: '🙌', dots: '⚫×10', objects: '🐤×10' },
];

export default function KenalAngka({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'learn' | 'quiz' | 'complete'>('menu');
  const [current, setCurrent] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const num = NUMBERS[current];

  const handleQuizAnswer = (answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    const isCorrect = answer === NUMBERS[quizIndex].n;
    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (quizIndex < 9) {
        setQuizIndex(i => i + 1);
        setSelected(null);
      } else {
        setStep('complete');
      }
    }, 800);
  };

  const handleComplete = () => {
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : 1;
    onComplete(stars, { score, total });
  };

  // ===== MENU =====
  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🌟</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Kenal Angka!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar angka 1 sampai 10 dengan cara seru! 🎯</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {NUMBERS.map((n, i) => (
          <div key={i} style={{ fontSize: '30px', animation: `float ${1.5 + i * 0.2}s ease-in-out infinite` }}>{n.emoji}</div>
        ))}
      </div>
      <button onClick={() => setStep('learn')} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
        🚀 Mulai Belajar!
      </button>
    </div>
  );

  // ===== LEARN =====
  if (step === 'learn') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '14px', color: theme.accent || '#7c3aed', fontWeight: '700', marginBottom: '8px' }}>
        📖 Angka {current + 1} dari 10
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '100px', marginBottom: '16px' }}>{num.emoji}</div>
        <div style={{ fontSize: '60px', fontWeight: '900', color: theme.heading, marginBottom: '16px' }}>{num.n}</div>
        <div style={{ fontSize: '40px', letterSpacing: '8px', marginBottom: '12px' }}>{num.dots}</div>
        <div style={{ fontSize: '20px', color: theme.textSecondary }}>{num.objects}</div>
        <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '12px', fontSize: '14px', color: '#92400e' }}>
          🗣️ "{num.n === 1 ? 'Satu' : num.n === 2 ? 'Dua' : num.n === 3 ? 'Tiga' : num.n === 4 ? 'Empat' : num.n === 5 ? 'Lima' : num.n === 6 ? 'Enam' : num.n === 7 ? 'Tujuh' : num.n === 8 ? 'Delapan' : num.n === 9 ? 'Sembilan' : 'Sepuluh'}"
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>
            ◀ Sebelumnya
          </button>
        )}
        {current < 9 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
            Selanjutnya ▶
          </button>
        ) : (
          <button onClick={() => { setQuizIndex(0); setStep('quiz'); }} style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
            🎯 Mulai Kuis!
          </button>
        )}
      </div>
    </div>
  );

  // ===== QUIZ =====
  if (step === 'quiz') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700', marginBottom: '4px' }}>
        🎯 Kuis ({quizIndex + 1}/10)
      </div>
      <div style={{ fontSize: '24px', color: theme.textSecondary, marginBottom: '16px' }}>
        Skor: {score} ⭐
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>{NUMBERS[quizIndex].objects}</div>
        <h3 style={{ fontSize: '24px', color: theme.heading, marginBottom: '20px' }}>Ada berapa?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          {[NUMBERS[quizIndex].n, 
            NUMBERS[quizIndex].n + 1 > 10 ? 1 : NUMBERS[quizIndex].n + 1,
            NUMBERS[quizIndex].n - 1 < 1 ? 10 : NUMBERS[quizIndex].n - 1,
            NUMBERS[quizIndex].n + 2 > 10 ? 2 : NUMBERS[quizIndex].n + 2
          ].sort(() => Math.random() - 0.5).map((opt, i) => (
            <button key={i} onClick={() => handleQuizAnswer(opt)} disabled={selected !== null}
              style={{
                padding: '16px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
                background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === NUMBERS[quizIndex].n ? '#10b981' : theme.bgHover,
                color: selected === opt || (selected !== null && opt === NUMBERS[quizIndex].n) ? '#fff' : theme.text,
                cursor: selected !== null ? 'default' : 'pointer',
                transform: selected === opt ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            >{opt}</button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div style={{ padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ Jawaban: ${NUMBERS[quizIndex].n}`}
        </div>
      )}
    </div>
  );

  // ===== COMPLETE =====
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Kamu Hebat!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0', boxShadow: theme.shadow }}>
        <p style={{ fontSize: '18px', color: theme.textSecondary }}>Skor: <strong style={{ color: theme.heading }}>{score}/10</strong></p>
        <div style={{ fontSize: '50px', marginTop: '12px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
        🏆 Klaim Hadiah!
      </button>
    </div>
  );
}