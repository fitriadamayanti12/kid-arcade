// app/components/games/kelas3/ThinkingBlocks.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE SOAL BAR MODEL
// ============================================
type ProblemType = 'part-whole' | 'comparison' | 'multiplication' | 'division' | 'two-step';

interface ProblemConfig {
  type: ProblemType;
  icon: string;
  label: string;
  color: string;
  bg: string;
}

const PROBLEM_TYPES: Record<ProblemType, ProblemConfig> = {
  'part-whole': { type: 'part-whole', icon: '🧩', label: 'Bagian-Keseluruhan', color: '#3b82f6', bg: '#eff6ff' },
  'comparison': { type: 'comparison', icon: '📊', label: 'Perbandingan', color: '#10b981', bg: '#ecfdf5' },
  'multiplication': { type: 'multiplication', icon: '✖️', label: 'Perkalian', color: '#f59e0b', bg: '#fffbeb' },
  'division': { type: 'division', icon: '➗', label: 'Pembagian', color: '#ef4444', bg: '#fef2f2' },
  'two-step': { type: 'two-step', icon: '🪜', label: 'Dua Langkah', color: '#8b5cf6', bg: '#f5f3ff' }
};

// ============================================
// GENERATOR SOAL
// ============================================
interface BlockQuestion {
  type: ProblemType;
  config: ProblemConfig;
  question: string;
  answer: number;
  blocks: { label: string; value: number; color: string; width: number }[];
  steps: string[];
  satuan: string;
}

const generateBlockQuestion = (): BlockQuestion & { opts: number[] } => {
  const types = Object.keys(PROBLEM_TYPES) as ProblemType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const config = PROBLEM_TYPES[type];
  
  let question = '', answer = 0, satuan = '';
  let blocks: { label: string; value: number; color: string; width: number }[] = [];
  let steps: string[] = [];

  switch (type) {
    case 'part-whole': {
      const a = Math.floor(Math.random() * 30) + 20;
      const b = Math.floor(Math.random() * 20) + 10;
      const total = a + b;
      const askTotal = Math.random() > 0.5;
      
      if (askTotal) {
        answer = total;
        question = `Siti punya ${a} permen dan Beni punya ${b} permen. Berapa total permen mereka?`;
        blocks = [
          { label: 'Siti', value: a, color: '#3b82f6', width: (a / total) * 100 },
          { label: 'Beni', value: b, color: '#f59e0b', width: (b / total) * 100 }
        ];
        steps = [
          `Siti = ${a} permen, Beni = ${b} permen`,
          `Total = Siti + Beni`,
          `Total = ${a} + ${b} = ${answer}`
        ];
      } else {
        answer = a;
        question = `Total ada ${total} buku. ${b} buku sudah dipinjam. Berapa sisa buku?`;
        blocks = [
          { label: 'Dipinjam', value: b, color: '#ef4444', width: (b / total) * 100 },
          { label: 'Sisa', value: a, color: '#10b981', width: (a / total) * 100 }
        ];
        steps = [
          `Total = ${total} buku, Dipinjam = ${b} buku`,
          `Sisa = Total - Dipinjam`,
          `Sisa = ${total} - ${b} = ${answer}`
        ];
      }
      satuan = '';
      break;
    }

    case 'comparison': {
      const selisih = Math.floor(Math.random() * 15) + 5;
      const kecil = Math.floor(Math.random() * 30) + 10;
      const besar = kecil + selisih;
      
      question = `Rina punya ${besar} stiker. Rina punya ${selisih} stiker lebih banyak dari Dina. Berapa stiker Dina?`;
      answer = kecil;
      blocks = [
        { label: 'Rina', value: besar, color: '#3b82f6', width: (besar / (besar + kecil)) * 100 },
        { label: 'Dina', value: kecil, color: '#f59e0b', width: (kecil / (besar + kecil)) * 100 }
      ];
      steps = [
        `Rina = ${besar} stiker`,
        `Rina lebih banyak ${selisih} dari Dina`,
        `Dina = ${besar} - ${selisih} = ${answer}`
      ];
      satuan = 'stiker';
      break;
    }

    case 'multiplication': {
      const groups = Math.floor(Math.random() * 5) + 2;
      const items = Math.floor(Math.random() * 8) + 2;
      answer = groups * items;
      
      question = `Ada ${groups} keranjang. Setiap keranjang berisi ${items} apel. Berapa total apel?`;
      blocks = Array.from({ length: groups }, (_, i) => ({
        label: `Keranjang ${i + 1}`,
        value: items,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
        width: 100 / groups
      }));
      steps = [
        `${groups} keranjang × ${items} apel`,
        `= ${groups} × ${items}`,
        `= ${answer} apel`
      ];
      satuan = 'apel';
      break;
    }

    case 'division': {
      const total = (Math.floor(Math.random() * 8) + 3) * (Math.floor(Math.random() * 5) + 2);
      const divisor = Math.floor(Math.random() * 4) + 2;
      while (total % divisor !== 0) continue;
      answer = total / divisor;
      
      question = `${total} anak dibagi ke ${divisor} kelompok sama banyak. Berapa anak per kelompok?`;
      const childWidth = 100 / divisor;
      blocks = Array.from({ length: divisor }, (_, i) => ({
        label: `Kel. ${i + 1}`,
        value: answer,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
        width: childWidth
      }));
      steps = [
        `Total = ${total} anak, ${divisor} kelompok`,
        `${total} ÷ ${divisor} = ?`,
        `${total} ÷ ${divisor} = ${answer} anak per kelompok`
      ];
      satuan = 'anak';
      break;
    }

    case 'two-step': {
      const a = Math.floor(Math.random() * 15) + 10;
      const b = Math.floor(Math.random() * 10) + 5;
      const c = Math.floor(Math.random() * 8) + 2;
      answer = a + b - c;
      
      question = `Budi punya ${a} kelereng. Diberi ${b} kelereng oleh Ayah. Lalu memberikan ${c} kelereng ke adik. Berapa sisa kelereng Budi?`;
      blocks = [
        { label: 'Awal', value: a, color: '#3b82f6', width: 40 },
        { label: 'Diberi', value: b, color: '#10b981', width: (b / (a + b)) * 40 },
        { label: 'Diberikan', value: c, color: '#ef4444', width: (c / (a + b)) * 40 }
      ];
      steps = [
        `Awal = ${a}, Diberi = ${b}`,
        `Total setelah diberi = ${a} + ${b} = ${a + b}`,
        `Diberikan ${c} ke adik`,
        `Sisa = ${a + b} - ${c} = ${answer}`
      ];
      satuan = 'kelereng';
      break;
    }
  }

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.max(1, Math.round(answer * (0.2 + Math.random() * 0.3)));
    const w = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
    if (w !== answer && !wrongs.has(w)) wrongs.add(w);
  }

  return {
    type, config, question, answer, blocks, steps, satuan,
    opts: [...wrongs, answer].sort(() => Math.random() - 0.5)
  };
};

// ============================================
// VISUAL BAR MODEL
// ============================================
const BarModelVisual = ({ blocks, totalLabel }: { blocks: BlockQuestion['blocks']; totalLabel?: string }) => {
  return (
    <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}>
      <div style={{ display: 'flex', height: '50px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
        {blocks.map((block, i) => (
          <div key={i} style={{
            width: `${block.width}%`, background: block.color + '40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRight: i < blocks.length - 1 ? '2px dashed #d1d5db' : 'none',
            position: 'relative', minWidth: blocks.length > 3 ? '50px' : 'auto'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: block.color }}>{block.value}</div>
              <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '1px' }}>{block.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function ThinkingBlocks({ onComplete }: Props) {
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
      setSoal(generateBlockQuestion());
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

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🟦</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Jenius Bar Model!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#3b82f6', margin: 0 }}>Skor: {score}/{TOTAL}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>🟦</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Thinking Blocks!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '4px', fontSize: '14px' }}>Metode Bar Model Singapore Math</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.values(PROBLEM_TYPES).slice(0, 5).map(t => (
            <div key={t.type} style={{ background: t.bg, borderRadius: '10px', padding: '8px 4px', textAlign: 'center', border: `1px solid ${t.color}40` }}>
              <div style={{ fontSize: '24px' }}>{t.icon}</div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: t.color }}>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#1e40af', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🇸🇬 Singapore Math:</strong> Metode #1 dunia (TIMSS)<br/>
          <strong>💡 Cara:</strong> Visualisasikan soal dengan blok warna!
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff', cursor: 'pointer' }}>
          🚀 Mulai!
        </button>
      </div>
    );
  }

  if (!soal) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: soal.config.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span style={{ fontSize: '18px' }}>{soal.config.icon}</span>
          <span style={{ fontWeight: '700', color: soal.config.color }}>{soal.config.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#3b82f6' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Bar Model Visual */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '2px solid #e5e7eb' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>🟦 BAR MODEL VISUAL</p>
        <BarModelVisual blocks={soal.blocks} />
        <div style={{ marginTop: '10px', padding: '10px', background: '#fffbeb', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{soal.question}</p>
        </div>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {soal.opts.map((opt: number, i: number) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === soal.answer;
          const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
          const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
              style={{
                padding: '14px', fontSize: '20px', fontWeight: '900', borderRadius: '12px', border: 'none',
                background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s'
              }}>
              {opt} {soal.satuan}
            </button>
          );
        })}
      </div>

      {/* Solution */}
      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 PENYELESAIAN:</p>
          {soal.steps.slice(0, solutionStep + 1).map((step: string, i: number) => (
            <p key={i} style={{
              fontSize: '12px', color: '#92400e', margin: '3px 0', padding: '4px 8px',
              background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px',
              fontWeight: i === solutionStep ? '700' : '400', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent'
            }}>{i + 1}. {step}</p>
          ))}
          {solutionStep < soal.steps.length - 1 && (
            <button onClick={revealStep}
              style={{ marginTop: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>
              Lihat Langkah ➡️
            </button>
          )}
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div style={{ marginTop: '10px' }}>
          <div style={{
            padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', animation: 'pop 0.3s ease-out',
            background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b'
          }}>
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${soal.answer} ${soal.satuan}`}
          </div>
          <button onClick={nextSoal}
            style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#3b82f6', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Soal Berikutnya ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}