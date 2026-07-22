// app/components/games/kelas3/GeometriFun.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const SHAPES = [
  { name: 'Persegi', emoji: '🟨', sides: 4, angles: 4, symmetry: 4 },
  { name: 'Persegi Panjang', emoji: '🟩', sides: 4, angles: 4, symmetry: 2 },
  { name: 'Segitiga Sama Sisi', emoji: '🔺', sides: 3, angles: 3, symmetry: 3 },
  { name: 'Lingkaran', emoji: '🟡', sides: 0, angles: 0, symmetry: 'tak terhingga' },
  { name: 'Jajar Genjang', emoji: '🔹', sides: 4, angles: 4, symmetry: 0 },
  { name: 'Trapesium', emoji: '🔷', sides: 4, angles: 4, symmetry: 0 },
  { name: 'Belah Ketupat', emoji: '💎', sides: 4, angles: 4, symmetry: 2 },
  { name: 'Layang-layang', emoji: '🪁', sides: 4, angles: 4, symmetry: 1 },
];

export default function GeometriFun({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'learn' | 'quiz' | 'complete'>('menu');
  const [current, setCurrent] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [mode, setMode] = useState<'sides' | 'angles' | 'symmetry'>('sides');
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const shape = SHAPES[current];
  const quizShape = SHAPES[quizIndex];

  const generateOptions = (correctVal: string | number) => {
    const allVals = SHAPES.map(s => mode === 'sides' ? s.sides.toString() : mode === 'angles' ? s.angles.toString() : s.symmetry.toString());
    const unique = [...new Set(allVals)].filter(v => v !== correctVal.toString()).slice(0, 3);
    return [...unique, correctVal.toString()].sort(() => Math.random() - 0.5);
  };

  const startQuiz = () => { setStep('quiz'); setQuizIndex(0); setScore(0); setTotal(0); };

  const handle = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const correctVal = mode === 'sides' ? quizShape.sides.toString() : mode === 'angles' ? quizShape.angles.toString() : quizShape.symmetry.toString();
    const ok = ans === correctVal;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (quizIndex < SHAPES.length - 1) {
        setQuizIndex(i => i + 1);
        setSelected(null);
        setMode(['sides', 'angles', 'symmetry'][Math.floor(Math.random() * 3)] as any);
      } else setStep('complete');
    }, 1000);
  };

  const stars = score >= 12 ? 3 : score >= 9 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>📐</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Geometri Fun!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Kenali sifat-sifat bangun datar! 🔷</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '40px', marginBottom: '24px' }}>
        {SHAPES.slice(0, 6).map((s, i) => <span key={i} title={s.name}>{s.emoji}</span>)}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => { setCurrent(0); setStep('learn'); }} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>📖 Belajar</button>
        <button onClick={startQuiz} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🎯 Kuis</button>
      </div>
    </div>
  );

  if (step === 'learn') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary, marginBottom: '8px' }}>📖 {current + 1}/{SHAPES.length}</div>
      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>{shape.emoji}</div>
        <h3 style={{ fontSize: '26px', fontWeight: '800', color: theme.heading, marginBottom: '16px' }}>{shape.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '22px', fontWeight: '900', color: '#3b82f6' }}>{shape.sides}</p>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Sisi</p>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444' }}>{shape.angles}</p>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Sudut</p>
          </div>
          <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>{shape.symmetry}</p>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Simetri</p>
          </div>
        </div>
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
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Kuis {quizIndex + 1}/{SHAPES.length}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '70px', marginBottom: '12px' }}>{quizShape.emoji}</div>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.heading, marginBottom: '4px' }}>{quizShape.name}</h3>
        <p style={{ fontSize: '16px', color: theme.textSecondary }}>
          {mode === 'sides' ? 'Berapa jumlah SISI?' : mode === 'angles' ? 'Berapa jumlah SUDUT?' : 'Berapa SIMETRI LIPAT?'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {generateOptions(mode === 'sides' ? quizShape.sides : mode === 'angles' ? quizShape.angles : quizShape.symmetry).map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '12px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : theme.bgHover,
              color: selected === opt ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : '❌ Coba lagi!'}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Ahli Geometri!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/{total}</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}