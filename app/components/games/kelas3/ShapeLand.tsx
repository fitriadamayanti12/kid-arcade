// app/components/games/kelas3/ShapeLand.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// KONFIGURASI BANGUN
// ============================================
type ShapeType = 'persegi' | 'persegi-panjang' | 'keduanya';
type QuestionType = 'keliling' | 'luas' | 'mencari-sisi' | 'aplikasi';

interface ShapeConfig {
  id: ShapeType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  rumusK: string;
  rumusL: string;
}

const SHAPES: ShapeConfig[] = [
  { id: 'persegi', label: 'Persegi', icon: '🟨', color: '#3b82f6', bg: '#eff6ff', rumusK: '4 × s', rumusL: 's × s' },
  { id: 'persegi-panjang', label: 'Persegi Panjang', icon: '🟩', color: '#10b981', bg: '#ecfdf5', rumusK: '2 × (p + l)', rumusL: 'p × l' },
  { id: 'keduanya', label: 'Campuran', icon: '🔷', color: '#8b5cf6', bg: '#f5f3ff', rumusK: 'semua', rumusL: 'semua' },
];

// ============================================
// INTERFACES
// ============================================
interface SoalShape {
  shape: ShapeType;
  type: QuestionType;
  soal: string;
  jawaban: number;
  langkah: string[];
  tips: string;
  visual: any;
  satuan: string;
}

interface StoryItem {
  soal: string;
  jawaban: number;
  type: QuestionType; // <-- PASTIKAN QuestionType
}

// ============================================
// GENERATOR SOAL
// ============================================
const generateSoal = (): SoalShape => {
  const shapeType = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const questionTypes: QuestionType[] = ['keliling', 'luas', 'mencari-sisi', 'aplikasi'];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  const isPersegi = shapeType.id === 'persegi' || (shapeType.id === 'keduanya' && Math.random() > 0.5);
  
  if (isPersegi) {
    const s = Math.floor(Math.random() * 10) + 3;
    
    switch (questionType) {
      case 'keliling': {
        const k = 4 * s;
        return {
          shape: 'persegi',
          type: 'keliling',
          soal: `Persegi dengan sisi ${s} cm. Berapa kelilingnya?`,
          jawaban: k,
          langkah: [`Rumus: K = 4 × s`, `K = 4 × ${s}`, `K = ${k} cm`],
          tips: 'Keliling persegi = 4 × sisi. Jumlahkan semua sisi!',
          visual: { type: 'persegi', s, warna: '#3b82f640' },
          satuan: 'cm'
        };
      }
      case 'luas': {
        const l = s * s;
        return {
          shape: 'persegi',
          type: 'luas',
          soal: `Persegi dengan sisi ${s} cm. Berapa luasnya?`,
          jawaban: l,
          langkah: [`Rumus: L = s × s`, `L = ${s} × ${s}`, `L = ${l} cm²`],
          tips: 'Luas persegi = sisi × sisi. Satuan luas = cm²!',
          visual: { type: 'persegi-luas', s, luas: l, warna: '#3b82f640' },
          satuan: 'cm²'
        };
      }
      case 'mencari-sisi': {
        const k = 4 * s;
        return {
          shape: 'persegi',
          type: 'mencari-sisi',
          soal: `Keliling persegi = ${k} cm. Berapa panjang sisinya?`,
          jawaban: s,
          langkah: [`Rumus: K = 4 × s`, `${k} = 4 × s`, `s = ${k} ÷ 4 = ${s} cm`],
          tips: 'Cari sisi dari keliling: s = K ÷ 4!',
          visual: { type: 'persegi', s, warna: '#3b82f640' },
          satuan: 'cm'
        };
      }
      case 'aplikasi': {
        const l = s * s;
        const stories: StoryItem[] = [
          { soal: `Taman berbentuk persegi dengan sisi ${s} m. Akan dipasang pagar. Panjang pagar?`, jawaban: 4 * s, type: 'keliling' },
          { soal: `Lantai persegi sisi ${s} m akan dipasang keramik. Luas keramik?`, jawaban: l, type: 'luas' },
        ];
        const story = stories[Math.floor(Math.random() * stories.length)];
        return {
          shape: 'persegi',
          type: 'aplikasi' as QuestionType,
          soal: story.soal,
          jawaban: story.jawaban,
          langkah: story.type === 'keliling' 
            ? [`Keliling = 4 × ${s} = ${4 * s} m`]
            : [`Luas = ${s} × ${s} = ${l} m²`],
          tips: 'Baca soal: pagar = keliling, keramik/lantai = luas!',
          visual: { type: 'taman', s },
          satuan: story.type === 'keliling' ? 'm' : 'm²'
        };
      }
      default: {
        // Fallback
        return {
          shape: 'persegi',
          type: 'keliling',
          soal: `Persegi dengan sisi ${s} cm. Berapa kelilingnya?`,
          jawaban: 4 * s,
          langkah: [`K = 4 × ${s} = ${4 * s} cm`],
          tips: 'Keliling = 4 × sisi',
          visual: { type: 'persegi', s },
          satuan: 'cm'
        };
      }
    }
  } else {
    // Persegi Panjang
    const p = Math.floor(Math.random() * 10) + 5;
    const l = Math.floor(Math.random() * 5) + 2;
    
    switch (questionType) {
      case 'keliling': {
        const k = 2 * (p + l);
        return {
          shape: 'persegi-panjang',
          type: 'keliling',
          soal: `Persegi panjang ${p} cm × ${l} cm. Keliling?`,
          jawaban: k,
          langkah: [`Rumus: K = 2 × (p + l)`, `K = 2 × (${p} + ${l})`, `K = 2 × ${p + l} = ${k} cm`],
          tips: 'Keliling = 2 × (panjang + lebar). Jumlahkan semua sisi!',
          visual: { type: 'persegi-panjang', p, l, warna: '#10b98140' },
          satuan: 'cm'
        };
      }
      case 'luas': {
        const luas = p * l;
        return {
          shape: 'persegi-panjang',
          type: 'luas',
          soal: `Persegi panjang ${p} cm × ${l} cm. Luas?`,
          jawaban: luas,
          langkah: [`Rumus: L = p × l`, `L = ${p} × ${l} = ${luas} cm²`],
          tips: 'Luas persegi panjang = panjang × lebar!',
          visual: { type: 'persegi-panjang-luas', p, l, luas, warna: '#10b98140' },
          satuan: 'cm²'
        };
      }
      case 'mencari-sisi': {
        const luas = p * l;
        return {
          shape: 'persegi-panjang',
          type: 'mencari-sisi',
          soal: `Luas persegi panjang = ${luas} cm². Panjang = ${p} cm. Lebar?`,
          jawaban: l,
          langkah: [`Rumus: L = p × l`, `${luas} = ${p} × l`, `l = ${luas} ÷ ${p} = ${l} cm`],
          tips: 'Cari lebar: l = Luas ÷ panjang!',
          visual: { type: 'persegi-panjang', p, l, warna: '#10b98140' },
          satuan: 'cm'
        };
      }
      case 'aplikasi': {
        const luas = p * l;
        const k = 2 * (p + l);
        const stories: StoryItem[] = [
          { soal: `Kebun ${p}m × ${l}m dipasang pagar. Panjang pagar?`, jawaban: k, type: 'keliling' },
          { soal: `Kebun ${p}m × ${l}m ditanami rumput. Luas rumput?`, jawaban: luas, type: 'luas' },
        ];
        const story = stories[Math.floor(Math.random() * stories.length)];
        return {
          shape: 'persegi-panjang',
          type: 'aplikasi' as QuestionType,
          soal: story.soal,
          jawaban: story.jawaban,
          langkah: story.type === 'keliling' 
            ? [`Keliling = 2 × (${p} + ${l}) = ${k} m`]
            : [`Luas = ${p} × ${l} = ${luas} m²`],
          tips: 'Pagar = keliling. Rumput/keramik = luas!',
          visual: { type: 'kebun', p, l },
          satuan: story.type === 'keliling' ? 'm' : 'm²'
        };
      }
      default: {
        // Fallback
        return {
          shape: 'persegi-panjang',
          type: 'keliling',
          soal: `Persegi panjang ${p} cm × ${l} cm. Keliling?`,
          jawaban: 2 * (p + l),
          langkah: [`K = 2 × (${p} + ${l}) = ${2 * (p + l)} cm`],
          tips: 'Keliling = 2 × (p + l)',
          visual: { type: 'persegi-panjang', p, l },
          satuan: 'cm'
        };
      }
    }
  }
};

// ============================================
// VISUAL BANGUN
// ============================================
const VisualShape = ({ visual }: { visual: any }) => {
  if (!visual) return null;

  if (visual.type === 'persegi' || visual.type === 'persegi-luas') {
    const { s, warna } = visual;
    const size = Math.min(120, s * 10);
    const isLuas = visual.type === 'persegi-luas';
    return (
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <svg width={size + 40} height={size + 40} viewBox={`0 0 ${size + 40} ${size + 40}`}>
          <rect x={20} y={20} width={size} height={size} fill={warna || '#3b82f640'} stroke="#3b82f6" strokeWidth="2" />
          <text x={20 + size/2} y={20 + size/2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af">{s} cm</text>
          <text x={20} y={12} fontSize="10" fill="#1e40af" fontWeight="600">{s} cm</text>
          <text x={20 + size + 5} y={20 + size/2} fontSize="10" fill="#1e40af" fontWeight="600">{s} cm</text>
        </svg>
        {isLuas && (
          <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>
            Luas = {s}×{s} = {s * s} cm²
          </div>
        )}
      </div>
    );
  }
  
  if (visual.type === 'persegi-panjang' || visual.type === 'persegi-panjang-luas') {
    const { p, l, warna } = visual;
    const scale = Math.min(100 / p, 60 / l, 15);
    const w = p * scale;
    const h = l * scale;
    return (
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <svg width={w + 60} height={h + 40} viewBox={`0 0 ${w + 60} ${h + 40}`}>
          <rect x={30} y={10} width={w} height={h} fill={warna || '#10b98140'} stroke="#10b981" strokeWidth="2" rx="2" />
          <text x={30 + w/2} y={10 + h/2 + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">p={p}cm</text>
          <text x={10} y={10 + h/2} fontSize="10" fill="#065f46" fontWeight="600">l={l}</text>
        </svg>
      </div>
    );
  }
  
  if (visual.type === 'taman' || visual.type === 'kebun') {
    return (
      <div style={{ fontSize: '50px', textAlign: 'center', marginBottom: '8px' }}>
        {visual.type === 'taman' ? '🏡' : '🌳'}
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
          {visual.type === 'taman' ? `sisi ${visual.s} m` : `${visual.p}m × ${visual.l}m`}
        </div>
      </div>
    );
  }
  
  return null;
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function ShapeLand({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<SoalShape | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const TOTAL = 12;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateSoal());
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
      setInputAnswer('');
    }
  }, [soalIndex, step]);

  const handleAnswer = (ans: number) => {
    if (answered || !soal) return;
    setAnswered(true);
    const ok = ans === soal.jawaban;
    setIsCorrect(ok);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else { setStreak(0); setShowSolution(true); }
  };

  const nextSoal = () => {
    if (soalIndex < TOTAL - 1) setSoalIndex(i => i + 1);
    else setStep('complete');
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.langkah.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); };
  const stars = score >= 10 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🔷</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Bangun Datar!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#10b981', margin: 0 }}>Skor: {score}/{TOTAL}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>🔷</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>ShapeLand!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Keliling & Luas Persegi & Persegi Panjang</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px', border: '2px solid #3b82f640' }}>
            <div style={{ fontSize: '36px' }}>🟨</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>Persegi</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>K=4s, L=s²</div>
          </div>
          <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '12px', border: '2px solid #10b98140' }}>
            <div style={{ fontSize: '36px' }}>🟩</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>Persegi Panjang</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>K=2(p+l), L=p×l</div>
          </div>
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff', cursor: 'pointer' }}>
          🚀 Mulai!
        </button>
      </div>
    );
  }

  if (!soal) return null;
  const shapeConfig = SHAPES.find(s => s.id === soal.shape)!;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: shapeConfig.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span>{shapeConfig.icon}</span>
          <span style={{ fontWeight: '700', color: shapeConfig.color }}>
            {shapeConfig.label} • {soal.type === 'keliling' ? 'Keliling' : soal.type === 'luas' ? 'Luas' : soal.type === 'mencari-sisi' ? 'Cari Sisi' : 'Aplikasi'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#10b981' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Rumus Quick Ref */}
      <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '4px 10px', marginBottom: '8px', fontSize: '10px', fontWeight: '600', color: '#065f46', display: 'inline-block' }}>
        {soal.shape === 'persegi' ? `📐 ${SHAPES[0].rumusK} | ${SHAPES[0].rumusL}` : `📐 ${SHAPES[1].rumusK} | ${SHAPES[1].rumusL}`}
      </div>

      {/* Visual */}
      <VisualShape visual={soal.visual} />

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${shapeConfig.color}20` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: shapeConfig.color, fontWeight: '600', marginTop: '8px', background: shapeConfig.bg, borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Answer */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <input type="number" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnswer(Number(inputAnswer))}
          placeholder={`... ${soal.satuan}`} disabled={answered} autoFocus
          style={{ padding: '10px', fontSize: '16px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${answered ? (isCorrect ? '#10b981' : '#ef4444') : '#d1d5db'}`, width: '120px', outline: 'none', background: '#fff' }} />
        <button onClick={() => handleAnswer(Number(inputAnswer))} disabled={answered || !inputAnswer}
          style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: shapeConfig.color, color: '#fff', fontWeight: '700', cursor: 'pointer' }}>✅</button>
      </div>

      {/* Solution */}
      {showSolution && soal && (
        <div style={{ marginTop: '10px', background: '#fef3c7', borderRadius: '10px', padding: '10px', textAlign: 'left', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>💡 LANGKAH:</p>
          {soal.langkah.slice(0, solutionStep + 1).map((step, i) => (
            <p key={i} style={{ fontSize: '11px', color: '#92400e', margin: '2px 0', padding: '3px 6px', background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px', fontWeight: i === solutionStep ? '700' : '400', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent' }}>{i + 1}. {step}</p>
          ))}
          {solutionStep < soal.langkah.length - 1 && (
            <button onClick={revealStep} style={{ marginTop: '4px', padding: '5px 12px', fontSize: '10px', fontWeight: '700', borderRadius: '6px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Lihat Langkah ➡️</button>
          )}
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', animation: 'pop 0.3s ease-out', background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b' }}>
            {isCorrect ? `🎉 Benar! ${soal.jawaban} ${soal.satuan}` : `❌ Jawaban: ${soal.jawaban} ${soal.satuan}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : shapeConfig.color, color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Lanjut ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}