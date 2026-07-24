// app/components/games/kelas3/MoneySmart.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// DATA UANG
// ============================================
const PECAHAN_UANG = [
  { nilai: 100000, emoji: '💴', label: 'Rp100.000', warna: '#ef4444' },
  { nilai: 50000, emoji: '💵', label: 'Rp50.000', warna: '#3b82f6' },
  { nilai: 20000, emoji: '💶', label: 'Rp20.000', warna: '#10b981' },
  { nilai: 10000, emoji: '💷', label: 'Rp10.000', warna: '#8b5cf6' },
  { nilai: 5000, emoji: '🪙', label: 'Rp5.000', warna: '#f59e0b' },
  { nilai: 2000, emoji: '🪙', label: 'Rp2.000', warna: '#6b7280' },
  { nilai: 1000, emoji: '🪙', label: 'Rp1.000', warna: '#f97316' },
  { nilai: 500, emoji: '🪙', label: 'Rp500', warna: '#ec4899' },
];

// ============================================
// TIPE LEVEL
// ============================================
type MoneyLevel = 'hitung-uang' | 'total-belanja' | 'kembalian' | 'pecahan' | 'menabung';

interface LevelConfig {
  id: MoneyLevel;
  label: string;
  icon: string;
  color: string;
  bg: string;
  desc: string;
}

const LEVELS: LevelConfig[] = [
  { id: 'hitung-uang', label: 'Hitung Uang', icon: '🧮', color: '#f59e0b', bg: '#fffbeb', desc: 'Jumlahkan uang' },
  { id: 'total-belanja', label: 'Total Belanja', icon: '🛒', color: '#3b82f6', bg: '#eff6ff', desc: 'Hitung belanjaan' },
  { id: 'kembalian', label: 'Kembalian', icon: '💵', color: '#10b981', bg: '#ecfdf5', desc: 'Hitung kembalian' },
  { id: 'pecahan', label: 'Pecahan Uang', icon: '🪙', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Pecah uang besar' },
  { id: 'menabung', label: 'Menabung', icon: '🏦', color: '#ef4444', bg: '#fef2f2', desc: 'Soal cerita uang' },
];

// ============================================
// HELPER
// ============================================
const formatRupiah = (n: number): string => {
  if (n >= 1000) return `Rp${n.toLocaleString('id-ID')}`;
  return `Rp${n}`;
};

const randomUang = (): number[] => {
  const jumlahPecahan = Math.floor(Math.random() * 4) + 2; // 2-5 pecahan
  const pecahan: number[] = [];
  for (let i = 0; i < jumlahPecahan; i++) {
    const p = PECAHAN_UANG[Math.floor(Math.random() * PECAHAN_UANG.length)];
    const qty = Math.floor(Math.random() * 3) + 1; // 1-3 lembar
    for (let j = 0; j < qty; j++) pecahan.push(p.nilai);
  }
  return pecahan.sort((a, b) => b - a);
};

// ============================================
// GENERATOR SOAL
// ============================================
interface SoalUang {
  level: MoneyLevel;
  soal: string;
  jawaban: number;
  langkah: string[];
  tips: string;
  visual: any;
}

const generateSoal = (level: MoneyLevel): SoalUang => {
  switch (level) {
    case 'hitung-uang': {
      const uang = randomUang();
      const total = uang.reduce((a, b) => a + b, 0);
      return {
        level,
        soal: 'Hitung total uang di atas!',
        jawaban: total,
        langkah: [
          ...uang.map((u, i) => `${formatRupiah(u)}`),
          `Total = ${uang.map(u => formatRupiah(u)).join(' + ')}`,
          `= ${formatRupiah(total)}`
        ],
        tips: 'Jumlahkan dari yang terbesar dulu!',
        visual: { type: 'uang', uang }
      };
    }

    case 'total-belanja': {
      const items = [
        { nama: 'Buku', harga: 5000, emoji: '📕' },
        { nama: 'Pensil', harga: 2000, emoji: '✏️' },
        { nama: 'Penghapus', harga: 1000, emoji: '🧹' },
        { nama: 'Penggaris', harga: 3000, emoji: '📐' },
      ];
      const beli: { nama: string; harga: number; emoji: string; qty: number }[] = [];
      const count = Math.floor(Math.random() * 3) + 2;
      const used = new Set<number>();
      while (beli.length < count) {
        const idx = Math.floor(Math.random() * items.length);
        if (!used.has(idx)) {
          used.add(idx);
          const qty = Math.floor(Math.random() * 2) + 1;
          beli.push({ ...items[idx], qty });
        }
      }
      const total = beli.reduce((sum, item) => sum + item.harga * item.qty, 0);
      return {
        level,
        soal: 'Hitung total belanjaan!',
        jawaban: total,
        langkah: [
          ...beli.map(b => `${b.emoji} ${b.nama} ${b.qty}×: ${formatRupiah(b.harga * b.qty)}`),
          `Total = ${formatRupiah(total)}`
        ],
        tips: 'Kalikan dulu harga × jumlah, lalu jumlahkan semua!',
        visual: { type: 'belanja', items: beli, total }
      };
    }

    case 'kembalian': {
      const total = (Math.floor(Math.random() * 30) + 5) * 1000;
      const pecahanBayar = [10000, 20000, 50000, 100000];
      let bayar = pecahanBayar[Math.floor(Math.random() * pecahanBayar.length)];
      while (bayar <= total) bayar = pecahanBayar[Math.floor(Math.random() * pecahanBayar.length)];
      const kembali = bayar - total;
      return {
        level,
        soal: `Total: ${formatRupiah(total)}. Bayar: ${formatRupiah(bayar)}. Kembalian?`,
        jawaban: kembali,
        langkah: [
          `Bayar = ${formatRupiah(bayar)}`,
          `Total = ${formatRupiah(total)}`,
          `Kembalian = ${formatRupiah(bayar)} - ${formatRupiah(total)}`,
          `= ${formatRupiah(kembali)}`
        ],
        tips: 'Kembalian = uang dibayar - total belanja!',
        visual: { type: 'kembalian', total, bayar, kembali }
      };
    }

    case 'pecahan': {
      const uangBesar = [100000, 50000, 20000][Math.floor(Math.random() * 3)];
      const pecah = [10000, 5000, 2000, 1000][Math.floor(Math.random() * 4)];
      const jumlah = uangBesar / pecah;
      return {
        level,
        soal: `1 lembar ${formatRupiah(uangBesar)} = ... lembar ${formatRupiah(pecah)}?`,
        jawaban: jumlah,
        langkah: [
          `${formatRupiah(uangBesar)} ÷ ${formatRupiah(pecah)}`,
          `= ${uangBesar} ÷ ${pecah}`,
          `= ${jumlah} lembar`
        ],
        tips: `${formatRupiah(uangBesar)} sama dengan ${jumlah} × ${formatRupiah(pecah)}!`,
        visual: { type: 'pecahan', uangBesar, pecah, jumlah }
      };
    }

    case 'menabung': {
      const stories = [
        {
          soal: 'Andi menabung Rp5.000 setiap hari. Dalam 1 minggu (7 hari), total tabungan?',
          jawaban: 35000,
          langkah: ['7 × Rp5.000 = Rp35.000']
        },
        {
          soal: 'Siti punya Rp50.000. Beli buku Rp12.000 dan pensil Rp3.000. Sisa uang?',
          jawaban: 35000,
          langkah: ['Total belanja = Rp12.000 + Rp3.000 = Rp15.000', 'Sisa = Rp50.000 - Rp15.000 = Rp35.000']
        },
      ];
      const story = stories[Math.floor(Math.random() * stories.length)];
      return {
        level,
        soal: story.soal,
        jawaban: story.jawaban,
        langkah: story.langkah,
        tips: 'Baca soal dengan teliti! Tentukan operasi yang tepat.',
        visual: { type: 'cerita' }
      };
    }
  }
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function MoneySmart({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<SoalUang | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const TOTAL = 15;
  const [levelSoalCount, setLevelSoalCount] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<MoneyLevel>('hitung-uang');

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      const levels = LEVELS.map(l => l.id);
      const lvl = levels[soalIndex % levels.length];
      setCurrentLevel(lvl);
      setSoal(generateSoal(lvl));
      setSelected(null);
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
      setInputAnswer('');
    }
  }, [soalIndex, step]);

  const handleAnswer = (ans: number) => {
    if (answered || !soal) return;
    setSelected(ans);
    setAnswered(true);
    const ok = ans === soal.jawaban;
    setIsCorrect(ok);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      if (streak + 1 >= 2) setLevelsCompleted(prev => new Set(prev).add(soal.level));
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
    if (soal && solutionStep < soal.langkah.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setLevelsCompleted(new Set()); setLevelSoalCount(0); };
  const stars = score >= 13 ? 3 : score >= 10 ? 2 : score >= 6 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>💰</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Uang!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#f59e0b', margin: 0 }}>Skor: {score}/{TOTAL}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>💰</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>MoneySmart!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Belajar Menghitung Uang</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {PECAHAN_UANG.slice(0, 6).map((p, i) => (
            <div key={i} style={{ background: '#fffbeb', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', border: `1px solid ${p.warna}40` }}>
              <div style={{ fontSize: '20px' }}>{p.emoji}</div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: p.warna }}>{p.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {LEVELS.map(l => (
            <div key={l.id} style={{ background: l.bg, borderRadius: '10px', padding: '8px', textAlign: 'center', border: `1px solid ${l.color}40` }}>
              <div style={{ fontSize: '18px' }}>{l.icon}</div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: l.color }}>{l.label}</div>
            </div>
          ))}
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #10b981)', color: '#fff', cursor: 'pointer' }}>
          💰 Mulai Belajar!
        </button>
      </div>
    );
  }

  if (!soal) return null;
  const levelConfig = LEVELS.find(l => l.id === soal.level)!;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: levelConfig.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span>{levelConfig.icon}</span>
          <span style={{ fontWeight: '700', color: levelConfig.color }}>{levelConfig.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#f59e0b' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Visual Uang */}
      {soal.visual.type === 'uang' && soal.visual.uang && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', background: '#fffbeb', borderRadius: '12px', padding: '10px' }}>
          {(soal.visual.uang as number[]).map((u, i) => {
            const pecahan = PECAHAN_UANG.find(p => p.nilai === u);
            return (
              <div key={i} style={{ fontSize: '24px', textAlign: 'center' }}>
                {pecahan?.emoji}
                <div style={{ fontSize: '8px', color: pecahan?.warna, fontWeight: '600' }}>{pecahan?.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Belanja */}
      {soal.visual.type === 'belanja' && soal.visual.items && (
        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '10px', marginBottom: '10px' }}>
          <p style={{ fontSize: '10px', color: '#065f46', fontWeight: '600', marginBottom: '4px' }}>🛒 KERANJANG</p>
          {(soal.visual.items as any[]).map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 6px' }}>
              <span>{item.emoji} {item.nama} {item.qty}×</span>
              <span style={{ fontWeight: '700' }}>{formatRupiah(item.harga * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #10b981', marginTop: '4px', paddingTop: '4px', textAlign: 'right', fontWeight: '700', fontSize: '12px', color: '#10b981' }}>
            {formatRupiah(soal.visual.total)}
          </div>
        </div>
      )}

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${levelConfig.color}20` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: levelConfig.color, fontWeight: '600', marginTop: '8px', background: levelConfig.bg, borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Answer */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <input type="number" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnswer(Number(inputAnswer))}
          placeholder="Rp..." disabled={answered} autoFocus
          style={{ padding: '10px', fontSize: '16px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${answered ? (isCorrect ? '#10b981' : '#ef4444') : '#d1d5db'}`, width: '130px', outline: 'none', background: '#fff' }} />
        <button onClick={() => handleAnswer(Number(inputAnswer))} disabled={answered || !inputAnswer}
          style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>✅</button>
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
            {isCorrect ? `🎉 Benar! ${formatRupiah(soal.jawaban)}` : `❌ Jawaban: ${formatRupiah(soal.jawaban)}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#f59e0b', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Lanjut ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}