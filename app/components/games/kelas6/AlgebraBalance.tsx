// app/components/games/kelas6/AlgebraBalance.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE PERSAMAAN
// ============================================
type EquationType = 'one-step' | 'two-step' | 'both-sides' | 'distribute';

const TYPE_CONFIG: Record<EquationType, { icon: string; label: string; color: string; bg: string; desc: string }> = {
  'one-step': { icon: '1️⃣', label: 'Satu Langkah', color: '#3b82f6', bg: '#eff6ff', desc: 'x + 3 = 7' },
  'two-step': { icon: '2️⃣', label: 'Dua Langkah', color: '#10b981', bg: '#ecfdf5', desc: '2x + 3 = 11' },
  'both-sides': { icon: '⚖️', label: 'Dua Sisi', color: '#f59e0b', bg: '#fffbeb', desc: '3x + 2 = x + 8' },
  'distribute': { icon: '📦', label: 'Distribusi', color: '#8b5cf6', bg: '#f5f3ff', desc: '2(x + 3) = 10' }
};

// ============================================
// GENERATOR SOAL
// ============================================
interface AlgebraQuestion {
  type: EquationType;
  equation: string;
  answer: number;
  steps: { action: string; equation: string }[];
  visualBalance: { left: string[]; right: string[] };
}

const generateAlgebraQuestion = (): AlgebraQuestion & { opts: number[] } => {
  const types = Object.keys(TYPE_CONFIG) as EquationType[];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let equation = '', answer = 0, visualBalance = { left: [], right: [] } as any;
  let steps: { action: string; equation: string }[] = [];

  switch (type) {
    case 'one-step': {
      const x = Math.floor(Math.random() * 15) + 2;
      const isAdd = Math.random() > 0.5;
      const num = Math.floor(Math.random() * 12) + 3;
      
      if (isAdd) {
        const result = x + num;
        equation = `x + ${num} = ${result}`;
        answer = x;
        steps = [
          { action: 'Persamaan awal', equation },
          { action: `Kurangi ${num} dari kedua sisi`, equation: `x + ${num} - ${num} = ${result} - ${num}` },
          { action: 'Sederhanakan', equation: `x = ${x}` }
        ];
        visualBalance = { left: [`x`, `+${num}`], right: [`${result}`] };
      } else {
        const result = x - num;
        equation = `x - ${num} = ${result}`;
        answer = x;
        steps = [
          { action: 'Persamaan awal', equation },
          { action: `Tambah ${num} ke kedua sisi`, equation: `x - ${num} + ${num} = ${result} + ${num}` },
          { action: 'Sederhanakan', equation: `x = ${x}` }
        ];
        visualBalance = { left: [`x`, `-${num}`], right: [`${result}`] };
      }
      break;
    }

    case 'two-step': {
      const x = Math.floor(Math.random() * 10) + 2;
      const coef = Math.floor(Math.random() * 4) + 2;
      const num = Math.floor(Math.random() * 10) + 2;
      const result = coef * x + num;
      
      equation = `${coef}x + ${num} = ${result}`;
      answer = x;
      steps = [
        { action: 'Persamaan awal', equation },
        { action: `Kurangi ${num} dari kedua sisi`, equation: `${coef}x + ${num} - ${num} = ${result} - ${num}` },
        { action: `Sederhanakan`, equation: `${coef}x = ${coef * x}` },
        { action: `Bagi kedua sisi dengan ${coef}`, equation: `x = ${x}` }
      ];
      visualBalance = { left: [`${coef}x`, `+${num}`], right: [`${result}`] };
      break;
    }

    case 'both-sides': {
      const x = Math.floor(Math.random() * 8) + 2;
      const coefLeft = Math.floor(Math.random() * 3) + 2;
      const constLeft = Math.floor(Math.random() * 8) + 2;
      const coefRight = 1;
      const constRight = coefLeft * x + constLeft - coefRight * x;
      
      equation = `${coefLeft}x + ${constLeft} = x + ${constRight}`;
      answer = x;
      steps = [
        { action: 'Persamaan awal', equation },
        { action: `Kurangi x dari kedua sisi`, equation: `${coefLeft}x - x + ${constLeft} = x - x + ${constRight}` },
        { action: `Sederhanakan`, equation: `${coefLeft - 1}x + ${constLeft} = ${constRight}` },
        { action: `Kurangi ${constLeft}`, equation: `${coefLeft - 1}x = ${constRight - constLeft}` },
        { action: `Bagi dengan ${coefLeft - 1}`, equation: `x = ${x}` }
      ];
      visualBalance = { left: [`${coefLeft}x`, `+${constLeft}`], right: [`x`, `+${constRight}`] };
      break;
    }

    case 'distribute': {
      const x = Math.floor(Math.random() * 8) + 2;
      const coef = Math.floor(Math.random() * 3) + 2;
      const inside = Math.floor(Math.random() * 8) + 2;
      const result = coef * (x + inside);
      
      equation = `${coef}(x + ${inside}) = ${result}`;
      answer = x;
      steps = [
        { action: 'Persamaan awal', equation },
        { action: `Distribusi: ${coef} × x + ${coef} × ${inside}`, equation: `${coef}x + ${coef * inside} = ${result}` },
        { action: `Kurangi ${coef * inside}`, equation: `${coef}x = ${coef * x}` },
        { action: `Bagi dengan ${coef}`, equation: `x = ${x}` }
      ];
      visualBalance = { left: [`${coef}(x+${inside})`], right: [`${result}`] };
      break;
    }
  }

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.max(1, Math.round(answer * 0.3));
    const w = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
    if (w !== answer && !wrongs.has(w)) wrongs.add(w);
  }

  return { type, equation, answer, steps, visualBalance, opts: [...wrongs, answer].sort(() => Math.random() - 0.5) };
};

// ============================================
// VISUAL TIMBANGAN
// ============================================
const BalanceVisual = ({ visual, answer }: { visual: AlgebraQuestion['visualBalance']; answer: number }) => {
  return (
    <div style={{ position: 'relative', height: '100px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
      {/* Timbangan */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '60px', background: '#6b7280', borderRadius: '2px' }} />
      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '6px', background: '#6b7280', borderRadius: '3px' }} />
      
      {/* Left pan */}
      <div style={{ position: 'absolute', bottom: '36px', left: '30%', transform: 'translateX(-50%)' }}>
        <div style={{
          background: '#eff6ff', borderRadius: '10px', padding: '6px 12px', border: '2px solid #3b82f6',
          fontSize: '13px', fontWeight: '700', color: '#1e40af', textAlign: 'center', minWidth: '60px'
        }}>
          {visual.left.join(' ')}
        </div>
      </div>
      
      {/* Right pan */}
      <div style={{ position: 'absolute', bottom: '36px', left: '70%', transform: 'translateX(-50%)' }}>
        <div style={{
          background: '#ecfdf5', borderRadius: '10px', padding: '6px 12px', border: '2px solid #10b981',
          fontSize: '13px', fontWeight: '700', color: '#065f46', textAlign: 'center', minWidth: '60px'
        }}>
          {visual.right.join(' ')}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
        x = {answer}
      </div>
    </div>
  );
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function AlgebraBalance({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<any>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const TOTAL = 10;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateAlgebraQuestion());
      setSelected(null);
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
    }
  }, [soalIndex, step]);

  const handleAnswer = (ans: number) => {
    if (answered || !soal) return;
    setSelected(ans);
    setAnswered(true);
    const ok = ans === soal.answer;
    setIsCorrect(ok);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else { setStreak(0); setShowSolution(true); }
  };

  const nextSoal = () => {
    if (soalIndex < TOTAL - 1) setSoalIndex(i => i + 1);
    else setStep('complete');
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.steps.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); };
  const stars = score >= 9 ? 3 : score >= 6 ? 2 : score >= 3 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>⚖️</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Aljabar!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>⚖️</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Algebra Balance!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Timbangan Aljabar Interaktif</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.entries(TYPE_CONFIG).map(([key, t]) => (
            <div key={key} style={{ background: t.bg, borderRadius: '10px', padding: '8px', border: `1px solid ${t.color}40` }}>
              <div style={{ fontSize: '18px' }}>{t.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: t.color }}>{t.label}</div>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#5b21b6', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>⚖️ Konsep:</strong> Apa yang dilakukan di satu sisi, harus dilakukan di sisi lain!<br/>
          <strong>💡 Tips:</strong> Tujuan = isolasi x. Gunakan operasi kebalikan.
        </div>
        <button onClick={start} style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', cursor: 'pointer' }}>🚀 Mulai!</button>
      </div>
    );
  }

  if (!soal) return null;
  const config = TYPE_CONFIG[soal.type as EquationType];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: config.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <span>{config.icon}</span>
          <span style={{ fontWeight: '700', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#8b5cf6' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Balance Visual */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '12px', marginBottom: '10px', border: '2px solid #e5e7eb' }}>
        <BalanceVisual visual={soal.visualBalance} answer={soal.answer} />
      </div>

      {/* Equation */}
      <div style={{ background: config.bg, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1f2937', margin: 0, letterSpacing: '2px' }}>
          {soal.equation}
        </h2>
        <p style={{ fontSize: '14px', color: config.color, fontWeight: '700', marginTop: '6px' }}>
          Cari nilai x!
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {soal.opts.map((opt: number, i: number) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === soal.answer;
          const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
          const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
              style={{ padding: '14px', fontSize: '20px', fontWeight: '900', borderRadius: '12px', border: 'none', background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              x = {opt}
            </button>
          );
        })}
      </div>

      {/* Solution Steps */}
      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 PENYELESAIAN:</p>
          {soal.steps.slice(0, solutionStep + 1).map((step: any, i: number) => (
            <div key={i} style={{ margin: '4px 0', padding: '6px 8px', background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent' }}>
              <p style={{ fontSize: '11px', color: '#92400e', fontWeight: '600', margin: '0 0 2px' }}>{step.action}</p>
              <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '900', margin: 0 }}>{step.equation}</p>
            </div>
          ))}
          {solutionStep < soal.steps.length - 1 && (
            <button onClick={revealStep} style={{ marginTop: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Lihat Langkah ➡️</button>
          )}
        </div>
      )}

      {answered && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', animation: 'pop 0.3s ease-out', background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b' }}>
            {isCorrect ? '🎉 Benar!' : `❌ x = ${soal.answer}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#8b5cf6', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Soal Berikutnya ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}