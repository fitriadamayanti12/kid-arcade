// app/components/games/paud/BentukWarna.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const SHAPES = [
  { shape: '🔴', name: 'Lingkaran', color: 'Merah' },
  { shape: '🟦', name: 'Persegi', color: 'Biru' },
  { shape: '🔺', name: 'Segitiga', color: 'Merah' },
  { shape: '🟨', name: 'Persegi', color: 'Kuning' },
  { shape: '🟢', name: 'Lingkaran', color: 'Hijau' },
  { shape: '🟪', name: 'Persegi', color: 'Ungu' },
  { shape: '⭐', name: 'Bintang', color: 'Kuning' },
  { shape: '💚', name: 'Hati', color: 'Hijau' },
];

export default function BentukWarna({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'learn' | 'quiz' | 'complete'>('menu');
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState<'shape' | 'color'>('shape');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);

  const shape = SHAPES[current];
  const quizShape = SHAPES[quizIndex];

  const generateShapeOptions = () => {
    const names = [...new Set(SHAPES.map(s => s.name))];
    const correct = quizShape.name;
    const wrong = names.filter(n => n !== correct).slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  };

  const generateColorOptions = () => {
    const colors = [...new Set(SHAPES.map(s => s.color))];
    const correct = quizShape.color;
    const wrong = colors.filter(c => c !== correct).slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  };

  const startQuiz = () => {
    setQuizIndex(0);
    setMode(Math.random() > 0.5 ? 'shape' : 'color');
    setStep('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (selected !== null) return;
    setSelected(answer);
    const isCorrect = mode === 'shape' ? answer === quizShape.name : answer === quizShape.color;
    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (quizIndex < SHAPES.length - 1) {
        setQuizIndex(i => i + 1);
        setSelected(null);
        setMode(Math.random() > 0.5 ? 'shape' : 'color');
      } else {
        setStep('complete');
      }
    }, 1000);
  };

  const handleComplete = () => {
    const stars = score >= 7 ? 3 : score >= 5 ? 2 : 1;
    onComplete(stars, { score, total });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔺</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Bentuk & Warna!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Kenali bentuk dan warna dengan seru! 🎨</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '40px', marginBottom: '24px' }}>
        {['🔴', '🟦', '🔺', '🟨', '🟢', '⭐'].map((s, i) => <span key={i} style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{s}</span>)}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => { setCurrent(0); setStep('learn'); }} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>📖 Belajar Dulu</button>
        <button onClick={startQuiz} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🎯 Langsung Kuis</button>
      </div>
    </div>
  );

  if (step === 'learn') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary, marginBottom: '8px' }}>📖 {current + 1}/{SHAPES.length}</div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '100px', marginBottom: '16px' }}>{shape.shape}</div>
        <h3 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>{shape.name}</h3>
        <p style={{ fontSize: '20px', color: theme.textSecondary }}>Warna: {shape.color}</p>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {current > 0 && <button onClick={() => setCurrent(c => c - 1)} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>◀</button>}
        {current < SHAPES.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>▶</button>
        ) : (
          <button onClick={startQuiz} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🎯 Kuis!</button>
        )}
      </div>
    </div>
  );

  if (step === 'quiz') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>{quizIndex + 1}/{SHAPES.length}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>{quizShape.shape}</div>
        <h3 style={{ fontSize: '20px', color: theme.heading }}>
          {mode === 'shape' ? 'Apa nama bentuk ini?' : 'Apa warna bentuk ini?'}
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
        {(mode === 'shape' ? generateShapeOptions() : generateColorOptions()).map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : theme.bgHover,
              color: selected === opt ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ ${mode === 'shape' ? quizShape.name : quizShape.color}`}
        </div>
      )}
    </div>
  );

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Selesai!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: {score}/{SHAPES.length}</p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}