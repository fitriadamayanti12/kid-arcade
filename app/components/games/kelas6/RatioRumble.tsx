// app/components/games/kelas6/RatioRumble.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE SOAL RASIO
// ============================================
type RatioType = 'equivalent' | 'missing-value' | 'comparison' | 'real-world' | 'scale';

interface RatioConfig {
  type: RatioType;
  icon: string;
  label: string;
  color: string;
  bg: string;
  desc: string;
}

const RATIO_TYPES: Record<RatioType, RatioConfig> = {
  'equivalent': { type: 'equivalent', icon: '🔄', label: 'Rasio Senilai', color: '#3b82f6', bg: '#eff6ff', desc: 'Cari rasio yang sama' },
  'missing-value': { type: 'missing-value', icon: '❓', label: 'Nilai Hilang', color: '#10b981', bg: '#ecfdf5', desc: 'Temukan nilai yang hilang' },
  'comparison': { type: 'comparison', icon: '⚖️', label: 'Perbandingan', color: '#f59e0b', bg: '#fffbeb', desc: 'Bandingkan dua rasio' },
  'real-world': { type: 'real-world', icon: '🛒', label: 'Dunia Nyata', color: '#ef4444', bg: '#fef2f2', desc: 'Resep, peta, diskon' },
  'scale': { type: 'scale', icon: '🗺️', label: 'Skala', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Skala peta & model' }
};

// ============================================
// GENERATOR SOAL RASIO
// ============================================
interface RatioQuestion {
  type: RatioType;
  config: RatioConfig;
  question: string;
  context: string;
  visual: string;
  answer: number;
  steps: string[];
  hint: string;
  satuan: string;
}

const generateRatioQuestion = (): RatioQuestion & { opts: number[] } => {
  const types = Object.keys(RATIO_TYPES) as RatioType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const config = RATIO_TYPES[type];
  
  let question = '', context = '', visual = '', hint = '', satuan = '';
  let answer = 0;
  let steps: string[] = [];

  switch (type) {
    case 'equivalent': {
      const base1 = Math.floor(Math.random() * 5) + 2;
      const base2 = Math.floor(Math.random() * 5) + 2;
      const multiplier = Math.floor(Math.random() * 4) + 2;
      const target1 = base1 * multiplier;
      const target2 = base2 * multiplier;
      
      if (Math.random() > 0.5) {
        // Cari nilai yang tidak senilai
        const wrongMultiplier = multiplier + (Math.random() > 0.5 ? 1 : -1) || multiplier + 2;
        const wrong1 = base1 * wrongMultiplier;
        const wrong2 = base2 * wrongMultiplier;
        answer = 0; // index opsi yang benar
        
        question = `Mana yang SENILAI dengan ${base1} : ${base2}?`;
        context = 'Rasio senilai = dikali/dibagi dengan angka yang sama';
        visual = `${base1}:${base2} → ×${multiplier} → ${target1}:${target2}`;
        hint = 'Kalikan/pembagi harus sama untuk kedua sisi!';
        satuan = '';
        steps = [
          `Rasio awal: ${base1} : ${base2}`,
          `Cek opsi: ${target1}:${target2} → ${target1}/${base1} = ${multiplier}, ${target2}/${base2} = ${multiplier}`,
          `Keduanya dikali ${multiplier} → SENILAI ✅`
        ];
      } else {
        const cari = Math.random() > 0.5 ? 'depan' : 'belakang';
        const known = cari === 'depan' ? target2 : target1;
        answer = cari === 'depan' ? target1 : target2;
        question = `${base1} : ${base2} = ? : ${known}. Cari nilai ?`;
        context = 'Gunakan perkalian silang';
        visual = `${base1}/${base2} = ?/${known}`;
        hint = `Kalikan silang: ${base1} × ${known} = ${base2} × ?`;
        satuan = '';
        steps = [
          `${base1} : ${base2} = ? : ${known}`,
          `Kalikan silang: ${base1} × ${known} = ${base2} × ?`,
          `${base1 * known} = ${base2} × ?`,
          `? = ${base1 * known} / ${base2} = ${answer}`
        ];
      }
      break;
    }

    case 'missing-value': {
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 8) + 3;
      const multiplier = Math.floor(Math.random() * 3) + 2;
      const c = a * multiplier;
      answer = b * multiplier;
      
      question = `Jika ${a} buku harganya Rp${(a * 5000).toLocaleString()}, berapa harga ${c} buku?`;
      context = 'Gunakan rasio: buku : harga';
      visual = `${a} buku → Rp${(a * 5000).toLocaleString()}\n${c} buku → ?`;
      hint = `Harga per buku = Rp${(a * 5000) / a}`;
      satuan = 'rupiah';
      steps = [
        `Rasio: ${a} buku : Rp${(a * 5000).toLocaleString()}`,
        `Harga per buku = Rp${(a * 5000) / a} = Rp5.000`,
        `${c} buku = ${c} × Rp5.000`,
        `= Rp${answer.toLocaleString()}`
      ];
      break;
    }

    case 'comparison': {
      const a1 = Math.floor(Math.random() * 8) + 3;
      const b1 = Math.floor(Math.random() * 8) + 3;
      const a2 = Math.floor(Math.random() * 8) + 3;
      const b2 = Math.floor(Math.random() * 8) + 3;
      const ratio1 = a1 / b1;
      const ratio2 = a2 / b2;
      answer = ratio1 > ratio2 ? 0 : ratio1 < ratio2 ? 1 : 2;
      
      question = `Mana yang lebih BESAR?\nA) ${a1}:${b1}  B) ${a2}:${b2}`;
      context = 'Bandingkan dengan menyamakan penyebut';
      visual = `A) ${a1}/${b1} = ${(ratio1).toFixed(2)}\nB) ${a2}/${b2} = ${(ratio2).toFixed(2)}`;
      hint = 'Ubah ke desimal untuk membandingkan';
      satuan = '';
      steps = [
        `Rasio A: ${a1}/${b1} = ${ratio1.toFixed(2)}`,
        `Rasio B: ${a2}/${b2} = ${ratio2.toFixed(2)}`,
        ratio1 > ratio2 ? `${ratio1.toFixed(2)} > ${ratio2.toFixed(2)} → A lebih besar` :
        ratio1 < ratio2 ? `${ratio2.toFixed(2)} > ${ratio1.toFixed(2)} → B lebih besar` :
        `Sama besar!`
      ];
      break;
    }

    case 'real-world': {
      const scenarios = [
        { q: 'Resep kue: 2 gelas tepung untuk 3 butir telur. Butuh berapa gelas tepung untuk 12 telur?', a: 8, steps: ['2:3 = x:12', '2×12 = 3×x', '24 = 3x', 'x = 8'] },
        { q: 'Jarak 5 cm di peta = 20 km sebenarnya. Berapa km untuk 8 cm?', a: 32, steps: ['5:20 = 8:x', '5x = 160', 'x = 32 km'] },
        { q: 'Diskon: Rp150.000 jadi Rp120.000. Berapa % diskon?', a: 20, steps: ['Hemat = 150.000-120.000 = 30.000', '% = 30.000/150.000 × 100%', '= 20%'] },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      question = s.q;
      answer = s.a;
      steps = s.steps;
      context = 'Soal kehidupan sehari-hari';
      visual = '🛒📏💰';
      hint = 'Tentukan dulu rasionya!';
      satuan = '';
      break;
    }

    case 'scale': {
      const scale = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
      const jarakPeta = Math.floor(Math.random() * 8) + 3;
      answer = jarakPeta * scale / 100; // dalam meter
      
      question = `Skala 1:${scale}. Jarak di peta ${jarakPeta} cm. Jarak sebenarnya?`;
      context = `1 cm di peta = ${scale} cm sebenarnya`;
      visual = `Peta: ${jarakPeta} cm → Sebenarnya: ?`;
      hint = `Kalikan dengan ${scale}, lalu ubah ke meter`;
      satuan = 'meter';
      steps = [
        `Skala 1:${scale} artinya 1 cm = ${scale} cm`,
        `Jarak = ${jarakPeta} × ${scale} cm`,
        `= ${jarakPeta * scale} cm`,
        `= ${answer} meter (÷100)`
      ];
      break;
    }
  }

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.max(1, Math.round(answer * (0.2 + Math.random() * 0.4)));
    const w = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
    if (w !== answer && !wrongs.has(w)) wrongs.add(Math.round(w));
  }

  return {
    type, config, question, context, visual, answer, steps, hint, satuan,
    opts: [...wrongs, answer].sort(() => Math.random() - 0.5)
  };
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function RatioRumble({ onComplete }: Props) {
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
  const [typeMastered, setTypeMastered] = useState<Set<string>>(new Set());
  const TOTAL = 12;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateRatioQuestion());
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
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      if (streak + 1 >= 2) setTypeMastered(prev => new Set(prev).add(soal.type));
    } else {
      setStreak(0);
      setShowSolution(true);
    }
  };

  const nextSoal = () => {
    if (soalIndex < TOTAL - 1) setSoalIndex(i => i + 1);
    else setStep('complete');
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.steps.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setTypeMastered(new Set()); };
  const stars = score >= 10 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>⚖️</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Rasio!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#8b5cf6', margin: 0 }}>Skor: {score}/{TOTAL}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '4px 0 0' }}>Tipe dikuasai: {typeMastered.size}/{Object.keys(RATIO_TYPES).length}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL, typeMastered: Array.from(typeMastered) })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>⚖️</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Ratio Rumble!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '4px', fontSize: '14px' }}>Kuasai Rasio & Proporsi!</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.values(RATIO_TYPES).slice(0, 5).map(t => (
            <div key={t.type} style={{ background: t.bg, borderRadius: '10px', padding: '8px 4px', textAlign: 'center', border: `1px solid ${t.color}40` }}>
              <div style={{ fontSize: '24px' }}>{t.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: t.color }}>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#5b21b6', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🎯 Materi:</strong> Rasio senilai, perbandingan, skala, & soal cerita<br/>
          <strong>💡 Tips:</strong> Gunakan perkalian silang untuk mencari nilai hilang!
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', cursor: 'pointer' }}>
          🚀 Mulai Rumble!
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
          <span style={{ color: '#8b5cf6' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Tipe Progress */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
        {Object.keys(RATIO_TYPES).map(t => (
          <div key={t} style={{ flex: 1, height: '3px', borderRadius: '2px', background: typeMastered.has(t) ? RATIO_TYPES[t as RatioType].color : '#e5e7eb' }} />
        ))}
      </div>

      {/* Question Card */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: `2px solid ${soal.config.color}20` }}>
        <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>{soal.context}</p>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: '0 0 8px' }}>{soal.question}</h3>
        <div style={{ background: soal.config.bg, borderRadius: '8px', padding: '8px', fontSize: '12px', color: soal.config.color, fontWeight: '600' }}>
          {soal.visual}
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
                padding: '14px', fontSize: '18px', fontWeight: '900', borderRadius: '12px', border: 'none',
                background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s'
              }}>
              {soal.satuan === 'rupiah' ? `Rp${opt.toLocaleString()}` : soal.satuan ? `${opt} ${soal.satuan}` : opt}
            </button>
          );
        })}
      </div>

      {/* Solution */}
      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 LANGKAH:</p>
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
              Lihat Langkah Berikutnya ➡️
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
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${soal.answer}${soal.satuan ? ' ' + soal.satuan : ''}`}
          </div>
          <button onClick={nextSoal}
            style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#8b5cf6', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Soal Berikutnya ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}