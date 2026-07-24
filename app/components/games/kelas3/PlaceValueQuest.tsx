// app/components/games/kelas3/PlaceValueQuest.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// KONFIGURASI NILAI TEMPAT
// ============================================
const PLACE_VALUES = [
  { name: 'Ribuan', value: 1000, emoji: '🏢', color: '#ef4444', bg: '#fef2f2' },
  { name: 'Ratusan', value: 100, emoji: '🏠', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Puluhan', value: 10, emoji: '🪵', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Satuan', value: 1, emoji: '🟡', color: '#3b82f6', bg: '#eff6ff' }
];

type GameMode = 'build-number' | 'expand-number' | 'compare-value' | 'identify-place' | 'mystery-number';

const MODE_CONFIG: Record<GameMode, { icon: string; label: string; color: string; bg: string; desc: string }> = {
  'build-number': { icon: '🏗️', label: 'Bangun Angka', color: '#3b82f6', bg: '#eff6ff', desc: 'Susun dari nilai tempat' },
  'expand-number': { icon: '📐', label: 'Uraikan', color: '#10b981', bg: '#ecfdf5', desc: 'Pisahkan nilai tempat' },
  'compare-value': { icon: '⚖️', label: 'Bandingkan', color: '#f59e0b', bg: '#fffbeb', desc: 'Mana yang lebih besar?' },
  'identify-place': { icon: '🔍', label: 'Temukan Tempat', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Angka di tempat mana?' },
  'mystery-number': { icon: '🕵️', label: 'Angka Misteri', color: '#ef4444', bg: '#fef2f2', desc: 'Tebak dari petunjuk' }
};

// ============================================
// GENERATOR SOAL
// ============================================
interface PlaceValueQuestion {
  mode: GameMode;
  question: string;
  answer: number;
  steps: string[];
  visual: any;
  blocks: { value: number; label: string; emoji: string; color: string; count: number }[];
}

const generatePVQuestion = (): PlaceValueQuestion & { opts: number[] } => {
  const modes = Object.keys(MODE_CONFIG) as GameMode[];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  
  let question = '', answer = 0, steps: string[] = [], blocks: any[] = [];
  let visual: any = {};

  switch (mode) {
    case 'build-number': {
      const ribuan = Math.floor(Math.random() * 5) + 1;
      const ratusan = Math.floor(Math.random() * 10);
      const puluhan = Math.floor(Math.random() * 10);
      const satuan = Math.floor(Math.random() * 10);
      answer = ribuan * 1000 + ratusan * 100 + puluhan * 10 + satuan;
      
      question = `Bangun angka dari: ${ribuan} ribuan + ${ratusan} ratusan + ${puluhan} puluhan + ${satuan} satuan`;
      blocks = [
        { value: 1000, label: 'Ribuan', emoji: '🏢', color: '#ef4444', count: ribuan },
        { value: 100, label: 'Ratusan', emoji: '🏠', color: '#f59e0b', count: ratusan },
        { value: 10, label: 'Puluhan', emoji: '🪵', color: '#10b981', count: puluhan },
        { value: 1, label: 'Satuan', emoji: '🟡', color: '#3b82f6', count: satuan }
      ].filter(b => b.count > 0);
      steps = [
        `${ribuan} × 1000 = ${ribuan * 1000}`,
        `${ratusan} × 100 = ${ratusan * 100}`,
        `${puluhan} × 10 = ${puluhan * 10}`,
        `${satuan} × 1 = ${satuan}`,
        `Total = ${answer}`
      ];
      visual = { type: 'blocks' };
      break;
    }

    case 'expand-number': {
      const angka = Math.floor(Math.random() * 5000) + 1000;
      const rib = Math.floor(angka / 1000);
      const rat = Math.floor((angka % 1000) / 100);
      const pul = Math.floor((angka % 100) / 10);
      const sat = angka % 10;
      answer = angka;
      
      question = `Uraikan angka ${angka} dalam bentuk panjang!`;
      const parts = [];
      if (rib > 0) parts.push(`${rib}.000`);
      if (rat > 0) parts.push(`${rat}00`);
      if (pul > 0) parts.push(`${pul}0`);
      if (sat > 0) parts.push(`${sat}`);
      
      steps = [
        `Ribuan: ${rib} → ${rib * 1000}`,
        `Ratusan: ${rat} → ${rat * 100}`,
        `Puluhan: ${pul} → ${pul * 10}`,
        `Satuan: ${sat} → ${sat}`,
        `Bentuk panjang: ${parts.join(' + ')}`
      ];
      blocks = [
        { value: 1000, label: 'Ribuan', emoji: '🏢', color: '#ef4444', count: rib },
        { value: 100, label: 'Ratusan', emoji: '🏠', color: '#f59e0b', count: rat },
        { value: 10, label: 'Puluhan', emoji: '🪵', color: '#10b981', count: pul },
        { value: 1, label: 'Satuan', emoji: '🟡', color: '#3b82f6', count: sat }
      ].filter(b => b.count > 0);
      visual = { type: 'expand', angka, parts };
      break;
    }

    case 'compare-value': {
      const a = Math.floor(Math.random() * 4000) + 1000;
      const b = Math.floor(Math.random() * 4000) + 1000;
      answer = a > b ? a : b > a ? b : a;
      
      question = `Mana yang lebih BESAR?\nA) ${a.toLocaleString()}  atau  B) ${b.toLocaleString()}`;
      const larger = a > b ? 'A' : b > a ? 'B' : 'SAMA';
      steps = [
        `Bandingkan ribuan: ${Math.floor(a/1000)} vs ${Math.floor(b/1000)}`,
        a > b ? `${a.toLocaleString()} > ${b.toLocaleString()}` :
        b > a ? `${b.toLocaleString()} > ${a.toLocaleString()}` :
        `Keduanya sama: ${a.toLocaleString()}`,
        `Jawaban: ${larger === 'SAMA' ? 'Sama besar' : larger}`
      ];
      blocks = [
        { value: 1000, label: 'A', emoji: '🅰️', color: '#3b82f6', count: Math.floor(a/1000) },
        { value: 1000, label: 'B', emoji: '🅱️', color: '#ef4444', count: Math.floor(b/1000) }
      ];
      visual = { type: 'compare', a, b };
      break;
    }

    case 'identify-place': {
      const angka = Math.floor(Math.random() * 9000) + 1000;
      const positions = ['ribuan', 'ratusan', 'puluhan', 'satuan'];
      const posIndex = Math.floor(Math.random() * 4);
      const position = positions[posIndex];
      const divisors = [1000, 100, 10, 1];
      const digit = Math.floor((angka / divisors[posIndex]) % 10);
      answer = digit;
      
      question = `Angka ${digit} pada bilangan ${angka.toLocaleString()} menempati nilai...`;
      steps = [
        `Bilangan: ${angka.toLocaleString()}`,
        `Pisahkan: ${Math.floor(angka/1000)} | ${Math.floor((angka%1000)/100)} | ${Math.floor((angka%100)/10)} | ${angka%10}`,
        `Angka ${digit} ada di posisi ${position}`,
        `Nilainya = ${digit} × ${divisors[posIndex]} = ${digit * divisors[posIndex]}`
      ];
      blocks = [
        { value: 1000, label: 'Ribuan', emoji: '🏢', color: posIndex === 0 ? '#22c55e' : '#ef4444', count: Math.floor(angka/1000) },
        { value: 100, label: 'Ratusan', emoji: '🏠', color: posIndex === 1 ? '#22c55e' : '#f59e0b', count: Math.floor((angka%1000)/100) },
        { value: 10, label: 'Puluhan', emoji: '🪵', color: posIndex === 2 ? '#22c55e' : '#10b981', count: Math.floor((angka%100)/10) },
        { value: 1, label: 'Satuan', emoji: '🟡', color: posIndex === 3 ? '#22c55e' : '#3b82f6', count: angka%10 }
      ];
      visual = { type: 'identify', angka, position, digit };
      break;
    }

    case 'mystery-number': {
      const ribuan = Math.floor(Math.random() * 5) + 1;
      const ratusan = Math.floor(Math.random() * 10);
      const puluhan = Math.floor(Math.random() * 10);
      const satuan = Math.floor(Math.random() * 10);
      answer = ribuan * 1000 + ratusan * 100 + puluhan * 10 + satuan;
      
      const clues = [
        `Aku bilangan ${answer.toString().length} angka`,
        `Angka ribuanku ${ribuan}`,
        `Angka ratusanku ${ratusan < 5 ? 'kurang dari 5' : '5 atau lebih'}`,
        `Angka satuanku ${satuan % 2 === 0 ? 'genap' : 'ganjil'}`,
        `Aku ${answer % 2 === 0 ? 'genap' : 'ganjil'}`
      ];
      
      question = `Tebak aku!\n"${clues[0]}. ${clues[1]}. ${clues[4]}."`;
      steps = [
        `Petunjuk 1: ${clues[0]}`,
        `Petunjuk 2: ${clues[1]}`,
        `Petunjuk 3: ${clues[4]}`,
        `Susun: ${ribuan}${ratusan}${puluhan}${satuan}`,
        `Jawaban: ${answer}`
      ];
      blocks = [
        { value: 1000, label: '?', emoji: '❓', color: '#ef4444', count: ribuan },
        { value: 100, label: '?', emoji: '❓', color: '#f59e0b', count: ratusan },
        { value: 10, label: '?', emoji: '❓', color: '#10b981', count: puluhan },
        { value: 1, label: '?', emoji: '❓', color: '#3b82f6', count: satuan }
      ];
      visual = { type: 'mystery', clues };
      break;
    }
  }

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.max(1, Math.round(answer * (0.15 + Math.random() * 0.3)));
    const w = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
    if (w !== answer && !wrongs.has(w)) wrongs.add(Math.round(w));
  }

  return { mode, question, answer, steps, visual, blocks, opts: [...wrongs, answer].sort(() => Math.random() - 0.5) };
};

// ============================================
// VISUAL BLOK NILAI TEMPAT
// ============================================
const PlaceValueBlocks = ({ blocks }: { blocks: PlaceValueQuestion['blocks'] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
      {blocks.map((block, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '280px' }}>
          <div style={{ 
            background: block.color + '20', 
            borderRadius: '8px', 
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '700',
            color: block.color,
            minWidth: '70px',
            textAlign: 'center'
          }}>
            {block.label}
          </div>
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', flex: 1 }}>
            {Array.from({ length: Math.min(block.count, 8) }).map((_, j) => (
              <span key={j} style={{ fontSize: '18px' }}>{block.emoji}</span>
            ))}
            {block.count > 8 && <span style={{ fontSize: '11px', color: '#6b7280' }}>+{block.count - 8}</span>}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '900', color: block.color, minWidth: '40px', textAlign: 'right' }}>
            {block.count > 0 ? `${block.count}×${block.value}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function PlaceValueQuest({ onComplete }: Props) {
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
  const [modeMastered, setModeMastered] = useState<Set<string>>(new Set());
  const TOTAL = 12;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generatePVQuestion());
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
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); if (streak + 1 >= 2) setModeMastered(prev => new Set(prev).add(soal.mode)); }
    else { setStreak(0); setShowSolution(true); }
  };

  const nextSoal = () => {
    if (soalIndex < TOTAL - 1) setSoalIndex(i => i + 1);
    else setStep('complete');
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.steps.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setModeMastered(new Set()); };
  const stars = score >= 10 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🔢</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Nilai Tempat!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#10b981', margin: 0 }}>Skor: {score}/{TOTAL}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>Mode: {modeMastered.size}/{Object.keys(MODE_CONFIG).length}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>🔢</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Place Value Quest!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Nilai Tempat Ribuan-Satuan</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {PLACE_VALUES.map(pv => (
            <div key={pv.name} style={{ background: pv.bg, borderRadius: '12px', padding: '12px', textAlign: 'center', border: `2px solid ${pv.color}40` }}>
              <div style={{ fontSize: '30px' }}>{pv.emoji}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: pv.color }}>{pv.name}</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: pv.color }}>{pv.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#ecfdf5', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#065f46', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🎯 Mode:</strong> Bangun angka, uraikan, bandingkan, & tebak misteri!<br/>
          <strong>💡 Tips:</strong> Ribuan 🏢 × 1000 | Ratusan 🏠 × 100 | Puluhan 🪵 × 10 | Satuan 🟡 × 1
        </div>
        <button onClick={start} style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', cursor: 'pointer' }}>🚀 Mulai Quest!</button>
      </div>
    );
  }

  if (!soal) return null;
  const config = MODE_CONFIG[soal.mode as GameMode];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: config.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span>{config.icon}</span>
          <span style={{ fontWeight: '700', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#10b981' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Blocks Visual */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '2px solid #e5e7eb' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{config.desc}</p>
        <PlaceValueBlocks blocks={soal.blocks} />
        <div style={{ marginTop: '10px', padding: '10px', background: config.bg, borderRadius: '8px', whiteSpace: 'pre-line' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{soal.question}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {soal.opts.map((opt: number, i: number) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === soal.answer;
          const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
          const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
              style={{ padding: '14px', fontSize: '18px', fontWeight: '900', borderRadius: '12px', border: 'none', background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              {opt.toLocaleString()}
            </button>
          );
        })}
      </div>

      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 LANGKAH:</p>
          {soal.steps.slice(0, solutionStep + 1).map((step: string, i: number) => (
            <p key={i} style={{ fontSize: '12px', color: '#92400e', margin: '3px 0', padding: '4px 8px', background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px', fontWeight: i === solutionStep ? '700' : '400', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent' }}>{i + 1}. {step}</p>
          ))}
          {solutionStep < soal.steps.length - 1 && (
            <button onClick={revealStep} style={{ marginTop: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Lihat Langkah ➡️</button>
          )}
        </div>
      )}

      {answered && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', animation: 'pop 0.3s ease-out', background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b' }}>
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${soal.answer.toLocaleString()}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#3b82f6', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Soal Berikutnya ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}