// app/components/games/kelas3/MeasureQuest.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE PENGUKURAN
// ============================================
type MeasureType = 'panjang' | 'berat' | 'volume' | 'konversi' | 'aplikasi';

interface MeasureConfig {
  id: MeasureType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  satuan: string[];
}

const MEASURE_TYPES: MeasureConfig[] = [
  { id: 'panjang', label: 'Panjang', icon: '📏', color: '#3b82f6', bg: '#eff6ff', satuan: ['cm', 'm', 'km'] },
  { id: 'berat', label: 'Berat', icon: '⚖️', color: '#10b981', bg: '#ecfdf5', satuan: ['gram', 'kg', 'ons'] },
  { id: 'volume', label: 'Volume', icon: '🧪', color: '#f59e0b', bg: '#fffbeb', satuan: ['ml', 'liter'] },
  { id: 'konversi', label: 'Konversi', icon: '🔄', color: '#8b5cf6', bg: '#f5f3ff', satuan: ['semua'] },
  { id: 'aplikasi', label: 'Aplikasi', icon: '🛒', color: '#ef4444', bg: '#fef2f2', satuan: ['semua'] },
];

// ============================================
// DATA BENDA UNTUK VISUAL
// ============================================
const BENDA_PANJANG = [
  { nama: 'Pensil', emoji: '✏️', panjang: 15 }, // cm
  { nama: 'Buku', emoji: '📕', panjang: 25 },
  { nama: 'Meja', emoji: '🪑', panjang: 120 },
  { nama: 'Pintu', emoji: '🚪', panjang: 200 },
  { nama: 'Penggaris', emoji: '📐', panjang: 30 },
];

const BENDA_BERAT = [
  { nama: 'Apel', emoji: '🍎', berat: 150 }, // gram
  { nama: 'Buku', emoji: '📚', berat: 500 },
  { nama: 'Semangka', emoji: '🍉', berat: 3000 },
  { nama: 'Beras', emoji: '🍚', berat: 5000 },
  { nama: 'Gula', emoji: '🍬', berat: 1000 },
];

// ============================================
// HELPER
// ============================================
const konversiPanjang = (nilai: number, dari: string, ke: string): number => {
  const keCm: Record<string, number> = { mm: 0.1, cm: 1, m: 100, km: 100000 };
  const dalamCm = nilai * (keCm[dari] || 1);
  return dalamCm / (keCm[ke] || 1);
};

const konversiBerat = (nilai: number, dari: string, ke: string): number => {
  const keGram: Record<string, number> = { gram: 1, kg: 1000, ons: 100 };
  const dalamGram = nilai * (keGram[dari] || 1);
  return dalamGram / (keGram[ke] || 1);
};

const konversiVolume = (nilai: number, dari: string, ke: string): number => {
  const keMl: Record<string, number> = { ml: 1, liter: 1000 };
  const dalamMl = nilai * (keMl[dari] || 1);
  return dalamMl / (keMl[ke] || 1);
};

// ============================================
// GENERATOR SOAL
// ============================================
interface SoalUkur {
  type: MeasureType;
  soal: string;
  jawaban: number;
  langkah: string[];
  tips: string;
  visual: any;
  satuan: string;
}

const generateSoal = (type: MeasureType): SoalUkur => {
  switch (type) {
    case 'panjang': {
      const tipeRandom = Math.random();
      if (tipeRandom < 0.5) {
        // Membaca penggaris
        const benda = BENDA_PANJANG[Math.floor(Math.random() * BENDA_PANJANG.length)];
        const skala = Math.floor(benda.panjang * (0.6 + Math.random() * 0.4));
        return {
          type,
          soal: `Berapa panjang ${benda.emoji} ${benda.nama} pada penggaris?`,
          jawaban: skala,
          langkah: [
            `Lihat skala penggaris`,
            `${benda.emoji} ${benda.nama} mencapai angka ${skala}`,
            `Panjang = ${skala} cm`
          ],
          tips: 'Baca skala dari 0 sampai ujung benda. Setiap garis kecil = 1 mm, garis besar = 1 cm!',
          visual: { type: 'penggaris', benda, skala, maxScale: benda.panjang + 5 },
          satuan: 'cm'
        };
      } else {
        // Konversi sederhana
        const nilai = Math.floor(Math.random() * 9) + 1;
        const isMToCm = Math.random() > 0.5;
        const jawaban = isMToCm ? nilai * 100 : nilai;
        return {
          type,
          soal: isMToCm ? `${nilai} m = ... cm` : `${nilai * 100} cm = ... m`,
          jawaban,
          langkah: [
            isMToCm 
              ? `1 m = 100 cm. ${nilai} m = ${nilai} × 100 = ${jawaban} cm`
              : `100 cm = 1 m. ${nilai * 100} cm = ${nilai * 100} ÷ 100 = ${jawaban} m`
          ],
          tips: isMToCm ? 'm ke cm = × 100' : 'cm ke m = ÷ 100',
          visual: { type: 'konversi-visual', nilai, dari: isMToCm ? 'm' : 'cm', ke: isMToCm ? 'cm' : 'm', jawaban },
          satuan: isMToCm ? 'cm' : 'm'
        };
      }
    }

    case 'berat': {
      const benda = BENDA_BERAT[Math.floor(Math.random() * BENDA_BERAT.length)];
      const tipeRandom = Math.random();
      
      if (tipeRandom < 0.4) {
        // Membaca timbangan
        const beratTimbangan = Math.round(benda.berat * (0.7 + Math.random() * 0.3) / 50) * 50;
        return {
          type,
          soal: `Berapa berat ${benda.emoji} ${benda.nama} pada timbangan?`,
          jawaban: beratTimbangan,
          langkah: [
            `Lihat jarum timbangan`,
            `Jarum menunjuk ke ${beratTimbangan}`,
            `Berat = ${beratTimbangan} gram`
          ],
          tips: 'Baca angka yang ditunjuk jarum. Perhatikan satuan (gram/kg)!',
          visual: { type: 'timbangan', benda, berat: beratTimbangan },
          satuan: 'gram'
        };
      } else {
        // Konversi kg ke gram
        const kg = Math.floor(Math.random() * 5) + 1;
        const gram = kg * 1000;
        return {
          type,
          soal: `${kg} kg = ... gram`,
          jawaban: gram,
          langkah: [
            `1 kg = 1000 gram`,
            `${kg} kg = ${kg} × 1000 = ${gram} gram`
          ],
          tips: 'kg ke gram = × 1000. Ingat: 1 kg = 1000 gram!',
          visual: { type: 'konversi-berat', kg, gram },
          satuan: 'gram'
        };
      }
    }

    case 'volume': {
      const tipeRandom = Math.random();
      if (tipeRandom < 0.5) {
        const nilai = Math.floor(Math.random() * 9) + 1;
        const jawaban = nilai * 1000;
        return {
          type,
          soal: `${nilai} liter = ... ml`,
          jawaban,
          langkah: [
            `1 liter = 1000 ml`,
            `${nilai} liter = ${nilai} × 1000 = ${jawaban} ml`
          ],
          tips: 'liter ke ml = × 1000. Ingat: 1 liter = 1000 ml!',
          visual: { type: 'gelas-ukur', nilai, jawaban },
          satuan: 'ml'
        };
      } else {
        const benda = ['🍼', '🥛', '🧃', '🫗'][Math.floor(Math.random() * 4)];
        const volume = [250, 500, 1000, 1500][Math.floor(Math.random() * 4)];
        return {
          type,
          soal: `${benda} Gelas berisi ${volume} ml. Berapa liter?`,
          jawaban: volume / 1000,
          langkah: [
            `${volume} ml = ${volume} ÷ 1000`,
            `= ${volume / 1000} liter`
          ],
          tips: 'ml ke liter = ÷ 1000',
          visual: { type: 'gelas', benda, volume },
          satuan: 'liter'
        };
      }
    }

    case 'konversi': {
      // Campuran semua konversi
      const types = [
        { soal: (n: number) => `${n} m = ... cm`, hitung: (n: number) => n * 100, satuan: 'cm', tips: 'm ke cm × 100' },
        { soal: (n: number) => `${n} kg = ... gram`, hitung: (n: number) => n * 1000, satuan: 'gram', tips: 'kg ke gram × 1000' },
        { soal: (n: number) => `${n} liter = ... ml`, hitung: (n: number) => n * 1000, satuan: 'ml', tips: 'liter ke ml × 1000' },
        { soal: (n: number) => `${n * 100} cm = ... m`, hitung: (n: number) => n, satuan: 'm', tips: 'cm ke m ÷ 100' },
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      const n = Math.floor(Math.random() * 8) + 2;
      const jawaban = t.hitung(n);
      return {
        type,
        soal: t.soal(n),
        jawaban,
        langkah: [`Gunakan rumus konversi`, t.tips, `= ${jawaban} ${t.satuan}`],
        tips: t.tips,
        visual: { type: 'konversi-campuran' },
        satuan: t.satuan
      };
    }

    case 'aplikasi': {
      const stories = [
        {
          soal: 'Tali Andi 2 m, tali Budi 150 cm. Siapa yang lebih panjang? Berapa selisihnya (cm)?',
          jawaban: 50,
          langkah: ['Andi: 2 m = 200 cm', 'Budi: 150 cm', 'Selisih = 200 - 150 = 50 cm'],
          tips: 'Samakan satuan dulu sebelum membandingkan!'
        },
        {
          soal: 'Ibu beli 2 kg gula dan 500 gram kopi. Total berat (gram)?',
          jawaban: 2500,
          langkah: ['2 kg = 2000 gram', 'Total = 2000 + 500 = 2500 gram'],
          tips: 'Ubah semua ke satuan yang sama!'
        },
        {
          soal: 'Botol A: 1,5 liter. Botol B: 800 ml. Selisih volume (ml)?',
          jawaban: 700,
          langkah: ['1,5 liter = 1500 ml', 'Selisih = 1500 - 800 = 700 ml'],
          tips: 'Samakan satuan ke ml dulu!'
        },
      ];
      const story = stories[Math.floor(Math.random() * stories.length)];
      return {
        type,
        soal: story.soal,
        jawaban: story.jawaban,
        langkah: story.langkah,
        tips: story.tips,
        visual: { type: 'cerita' },
        satuan: 'cm'
      };
    }
  }
};

// ============================================
// KOMPONEN VISUAL PENGGARIS
// ============================================
const VisualPenggaris = ({ skala, maxScale }: { skala: number; maxScale: number }) => (
  <div style={{ position: 'relative', height: '60px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #d1d5db', marginBottom: '8px' }}>
    {/* Skala markings */}
    {Array.from({ length: maxScale + 1 }, (_, i) => (
      <div key={i} style={{
        position: 'absolute', left: `${(i / maxScale) * 100}%`, bottom: 0,
        height: i % 5 === 0 ? '40px' : '20px', width: '1px', background: i % 5 === 0 ? '#1f2937' : '#9ca3af'
      }}>
        {i % 5 === 0 && <span style={{ position: 'absolute', bottom: '42px', left: '-8px', fontSize: '9px', fontWeight: '700', color: '#1f2937', width: '20px', textAlign: 'center' }}>{i}</span>}
      </div>
    ))}
    {/* Arrow ke skala */}
    <div style={{ position: 'absolute', left: `${(skala / maxScale) * 100}%`, top: '-20px', fontSize: '16px', color: '#ef4444' }}>👇</div>
    <div style={{ position: 'absolute', left: `${(skala / maxScale) * 100}%`, top: '-38px', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '700', color: '#ef4444' }}>{skala} cm</div>
  </div>
);

// ============================================
// KOMPONEN VISUAL TIMBANGAN
// ============================================
const VisualTimbangan = ({ berat }: { berat: number }) => (
  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
    <div style={{ position: 'relative', width: '120px', height: '100px', margin: '0 auto', background: '#f0fdf4', borderRadius: '50%', border: '3px solid #10b981' }}>
      {/* Jarum */}
      <div style={{
        position: 'absolute', bottom: '50%', left: '50%', transformOrigin: 'bottom center',
        transform: `rotate(${(berat / 5000) * 180 - 90}deg)`,
        width: '3px', height: '40px', background: '#ef4444', borderRadius: '2px', transition: 'transform 0.5s'
      }} />
      <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#1f2937', borderRadius: '50%' }} />
    </div>
    <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: '700', color: '#10b981' }}>{berat} gram</div>
  </div>
);

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function MeasureQuest({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<SoalUkur | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [typesMastered, setTypesMastered] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const TOTAL = 15;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      const types = MEASURE_TYPES.map(t => t.id);
      const currentType = types[soalIndex % types.length];
      setSoal(generateSoal(currentType));
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
    const ok = Math.abs(ans - soal.jawaban) < 0.01;
    setIsCorrect(ok);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      if (streak + 1 >= 2) setTypesMastered(prev => new Set(prev).add(soal.type));
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

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setTypesMastered(new Set()); };
  const stars = score >= 13 ? 3 : score >= 10 ? 2 : score >= 6 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>📏</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Pengukuran!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#3b82f6', margin: 0 }}>Skor: {score}/{TOTAL}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>Tipe dikuasai: {typesMastered.size}/{MEASURE_TYPES.length}</p>
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
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>📏</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>MeasureQuest!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Pengukuran Panjang, Berat & Volume</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {MEASURE_TYPES.map(t => (
            <div key={t.id} style={{ background: t.bg, borderRadius: '10px', padding: '8px', textAlign: 'center', border: `1px solid ${t.color}40` }}>
              <div style={{ fontSize: '22px' }}>{t.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: t.color }}>{t.label}</div>
              <div style={{ fontSize: '8px', color: '#6b7280' }}>{t.satuan.join(', ')}</div>
            </div>
          ))}
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff', cursor: 'pointer' }}>
          🚀 Mulai Ukur!
        </button>
      </div>
    );
  }

  if (!soal) return null;
  const typeConfig = MEASURE_TYPES.find(t => t.id === soal.type)!;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: typeConfig.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span>{typeConfig.icon}</span>
          <span style={{ fontWeight: '700', color: typeConfig.color }}>{typeConfig.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#3b82f6' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Visual */}
      {soal.visual.type === 'penggaris' && (
        <VisualPenggaris skala={(soal.visual as any).skala} maxScale={(soal.visual as any).maxScale} />
      )}
      {soal.visual.type === 'timbangan' && (
        <VisualTimbangan berat={(soal.visual as any).berat} />
      )}
      {soal.visual.type === 'gelas' && (
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>
          {(soal.visual as any).benda}
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#f59e0b' }}>{(soal.visual as any).volume} ml</div>
        </div>
      )}

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${typeConfig.color}20` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: typeConfig.color, fontWeight: '600', marginTop: '8px', background: typeConfig.bg, borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Answer */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <input type="number" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnswer(Number(inputAnswer))}
          placeholder={`... ${soal.satuan}`} disabled={answered} autoFocus
          style={{ padding: '10px', fontSize: '16px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${answered ? (isCorrect ? '#10b981' : '#ef4444') : '#d1d5db'}`, width: '120px', outline: 'none', background: '#fff' }} />
        <button onClick={() => handleAnswer(Number(inputAnswer))} disabled={answered || !inputAnswer}
          style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>✅</button>
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
          <button onClick={nextSoal} style={{ marginTop: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#3b82f6', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Lanjut ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}