// app/components/games/kelas6/MixFractionKitchen.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE LEVEL
// ============================================
type LevelType = 
  | 'campuran-ke-biasa'    // Konversi campuran → pecahan biasa
  | 'biasa-ke-campuran'    // Konversi pecahan biasa → campuran
  | 'tambah-campuran'      // Penjumlahan
  | 'kurang-campuran'      // Pengurangan
  | 'kali-campuran'        // Perkalian
  | 'bagi-campuran'        // Pembagian
  | 'banding-campuran'     // Membandingkan
  | 'cerita-dapur';        // Soal cerita resep

interface LevelConfig {
  id: LevelType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  desc: string;
  unlock: number;
}

const LEVELS: LevelConfig[] = [
  { id: 'campuran-ke-biasa', label: 'Konversi 1', icon: '🔄', color: '#f59e0b', bg: '#fffbeb', desc: 'Campuran → Pecahan Biasa', unlock: 0 },
  { id: 'biasa-ke-campuran', label: 'Konversi 2', icon: '🔁', color: '#3b82f6', bg: '#eff6ff', desc: 'Pecahan Biasa → Campuran', unlock: 2 },
  { id: 'tambah-campuran', label: 'Tambah', icon: '➕', color: '#10b981', bg: '#ecfdf5', desc: 'Penjumlahan campuran', unlock: 4 },
  { id: 'kurang-campuran', label: 'Kurang', icon: '➖', color: '#ef4444', bg: '#fef2f2', desc: 'Pengurangan campuran', unlock: 6 },
  { id: 'kali-campuran', label: 'Kali', icon: '✖️', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Perkalian campuran', unlock: 8 },
  { id: 'bagi-campuran', label: 'Bagi', icon: '➗', color: '#ec4899', bg: '#fdf2f8', desc: 'Pembagian campuran', unlock: 10 },
  { id: 'banding-campuran', label: 'Bandingkan', icon: '⚖️', color: '#06b6d4', bg: '#ecfeff', desc: 'Mana lebih besar?', unlock: 12 },
  { id: 'cerita-dapur', label: 'Cerita Dapur', icon: '👨‍🍳', color: '#f97316', bg: '#fff7ed', desc: 'Soal resep & masakan', unlock: 14 },
];

// ============================================
// BAHAN DAPUR (untuk visual)
// ============================================
const BAHAN_DAPUR = [
  { nama: 'Tepung', emoji: '🌾', satuan: 'gelas', warna: '#f5deb3' },
  { nama: 'Gula', emoji: '🍬', satuan: 'sendok', warna: '#fff' },
  { nama: 'Minyak', emoji: '🫗', satuan: 'ml', warna: '#ffd700' },
  { nama: 'Susu', emoji: '🥛', satuan: 'gelas', warna: '#fff' },
  { nama: 'Telur', emoji: '🥚', satuan: 'butir', warna: '#fff5e6' },
  { nama: 'Coklat', emoji: '🍫', satuan: 'batang', warna: '#8b4513' },
  { nama: 'Keju', emoji: '🧀', satuan: 'potong', warna: '#ffd700' },
  { nama: 'Mentega', emoji: '🧈', satuan: 'sendok', warna: '#ffff00' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

interface PecahanCampuran {
  bulat: number;
  pembilang: number;
  penyebut: number;
}

const kePecahanBiasa = (pc: PecahanCampuran): { pembilang: number; penyebut: number } => ({
  pembilang: pc.bulat * pc.penyebut + pc.pembilang,
  penyebut: pc.penyebut
});

const sederhanakan = (pembilang: number, penyebut: number): { pembilang: number; penyebut: number } => {
  const fpb = gcd(Math.abs(pembilang), penyebut);
  return { pembilang: pembilang / fpb, penyebut: penyebut / fpb };
};

const keCampuran = (pembilang: number, penyebut: number): PecahanCampuran => {
  const bulat = Math.floor(Math.abs(pembilang) / penyebut) * (pembilang < 0 ? -1 : 1);
  const sisa = Math.abs(pembilang) % penyebut;
  return { bulat, pembilang: sisa, penyebut };
};

const formatCampuran = (pc: PecahanCampuran): string => {
  if (pc.pembilang === 0) return `${pc.bulat}`;
  if (pc.bulat === 0) return `${pc.pembilang}/${pc.penyebut}`;
  return `${pc.bulat} ${pc.pembilang}/${pc.penyebut}`;
};

const randomCampuran = (maxBulat: number = 4, maxPenyebut: number = 8): PecahanCampuran => {
  const bulat = Math.floor(Math.random() * maxBulat) + 1;
  const penyebut = Math.floor(Math.random() * (maxPenyebut - 2)) + 3; // 3-8
  const pembilang = Math.floor(Math.random() * (penyebut - 1)) + 1;
  return { bulat, pembilang, penyebut };
};

// ============================================
// GENERATOR SOAL
// ============================================
interface SoalDapur {
  level: LevelType;
  soal: string;
  jawaban: string;
  langkah: string[];
  tips: string;
  visual: any;
  opsi?: string[];
}

const generateSoal = (level: LevelType): SoalDapur => {
  switch (level) {
    case 'campuran-ke-biasa': {
      const pc = randomCampuran(4, 6);
      const pb = kePecahanBiasa(pc);
      const jawaban = `${pb.pembilang}/${pb.penyebut}`;
      return {
        level,
        soal: `${formatCampuran(pc)} = ... /${pc.penyebut}`,
        jawaban,
        langkah: [
          `${formatCampuran(pc)}`,
          `= (${pc.bulat} × ${pc.penyebut} + ${pc.pembilang}) / ${pc.penyebut}`,
          `= (${pc.bulat * pc.penyebut} + ${pc.pembilang}) / ${pc.penyebut}`,
          `= ${jawaban}`
        ],
        tips: 'Kalikan bilangan bulat dengan penyebut, lalu tambahkan pembilang!',
        visual: { type: 'konversi', pc, pb },
        opsi: [
          jawaban,
          `${pb.pembilang + 1}/${pc.penyebut}`,
          `${pc.pembilang}/${pc.penyebut * pc.bulat}`,
          `${pc.bulat * pc.penyebut}/${pc.pembilang}`
        ]
      };
    }

    case 'biasa-ke-campuran': {
      const penyebut = Math.floor(Math.random() * 5) + 3;
      const bulat = Math.floor(Math.random() * 4) + 2;
      const pembilang = bulat * penyebut + Math.floor(Math.random() * (penyebut - 1)) + 1;
      const pc = keCampuran(pembilang, penyebut);
      const jawaban = formatCampuran(pc);
      return {
        level,
        soal: `${pembilang}/${penyebut} = ... (pecahan campuran)`,
        jawaban,
        langkah: [
          `${pembilang} ÷ ${penyebut} = ${bulat} sisa ${pc.pembilang}`,
          `= ${bulat} ${pc.pembilang}/${penyebut}`,
          pc.pembilang > 0 ? `= ${jawaban}` : `= ${bulat}`
        ],
        tips: 'Bagi pembilang dengan penyebut. Hasil bagi = bilangan bulat, sisa = pembilang!',
        visual: { type: 'konversi-balik', pembilang, penyebut, pc },
        opsi: [
          jawaban,
          `${bulat + 1} ${pc.pembilang}/${penyebut}`,
          `${bulat} ${pc.pembilang + 1}/${penyebut}`,
          `${bulat} ${penyebut}/${pc.pembilang}`
        ]
      };
    }

    case 'tambah-campuran': {
      const a = randomCampuran(3, 5);
      const b = randomCampuran(2, 5);
      // Samakan penyebut
      const kpk = lcm(a.penyebut, b.penyebut);
      const pbA = kePecahanBiasa(a);
      const pbB = kePecahanBiasa(b);
      const jumlahPembilang = (pbA.pembilang * (kpk / a.penyebut)) + (pbB.pembilang * (kpk / b.penyebut));
      const hasil = keCampuran(jumlahPembilang, kpk);
      const jawaban = formatCampuran(hasil);
      return {
        level,
        soal: `${formatCampuran(a)} + ${formatCampuran(b)} = ?`,
        jawaban,
        langkah: [
          `Ubah ke pecahan biasa:`,
          `${formatCampuran(a)} = ${pbA.pembilang}/${a.penyebut}`,
          `${formatCampuran(b)} = ${pbB.pembilang}/${b.penyebut}`,
          `Samakan penyebut (KPK = ${kpk}):`,
          `${pbA.pembilang * (kpk / a.penyebut)}/${kpk} + ${pbB.pembilang * (kpk / b.penyebut)}/${kpk}`,
          `= ${jumlahPembilang}/${kpk}`,
          `= ${jawaban}`
        ],
        tips: 'Ubah ke pecahan biasa dulu, samakan penyebut, jumlahkan, sederhanakan!',
        visual: { type: 'operasi', a, b, op: '+', hasil },
        opsi: [
          jawaban,
          formatCampuran({ bulat: a.bulat + b.bulat, pembilang: a.pembilang + b.pembilang, penyebut: a.penyebut }),
          formatCampuran(keCampuran(jumlahPembilang + 1, kpk)),
          formatCampuran(keCampuran(jumlahPembilang - 1, kpk))
        ]
      };
    }

    case 'kurang-campuran': {
      // Pastikan a > b
      let a = randomCampuran(4, 6);
      let b = randomCampuran(2, 6);
      const pbA = kePecahanBiasa(a);
      const pbB = kePecahanBiasa(b);
      
      // Pastikan a > b dalam nilai
      const nilaiA = pbA.pembilang / pbA.penyebut;
      const nilaiB = pbB.pembilang / pbB.penyebut;
      if (nilaiB > nilaiA) [a, b] = [b, a];
      
      const pbAFinal = kePecahanBiasa(a);
      const pbBFinal = kePecahanBiasa(b);
      const kpk = lcm(a.penyebut, b.penyebut);
      const kurangPembilang = (pbAFinal.pembilang * (kpk / a.penyebut)) - (pbBFinal.pembilang * (kpk / b.penyebut));
      const hasil = keCampuran(kurangPembilang, kpk);
      const jawaban = formatCampuran(hasil);
      return {
        level,
        soal: `${formatCampuran(a)} - ${formatCampuran(b)} = ?`,
        jawaban,
        langkah: [
          `Ubah ke pecahan biasa:`,
          `${formatCampuran(a)} = ${pbAFinal.pembilang}/${a.penyebut}`,
          `${formatCampuran(b)} = ${pbBFinal.pembilang}/${b.penyebut}`,
          `Samakan penyebut (KPK = ${kpk}):`,
          `${pbAFinal.pembilang * (kpk / a.penyebut)}/${kpk} - ${pbBFinal.pembilang * (kpk / b.penyebut)}/${kpk}`,
          `= ${kurangPembilang}/${kpk}`,
          `= ${jawaban}`
        ],
        tips: 'Sama seperti penjumlahan, tapi dikurangi. Pastikan bilangan pertama lebih besar!',
        visual: { type: 'operasi', a, b, op: '-', hasil },
        opsi: [
          jawaban,
          formatCampuran(keCampuran(Math.abs(kurangPembilang) + 1, kpk)),
          formatCampuran({ bulat: Math.abs(a.bulat - b.bulat), pembilang: Math.abs(a.pembilang - b.pembilang), penyebut: a.penyebut }),
          formatCampuran(keCampuran(Math.abs(kurangPembilang) - 1, kpk))
        ]
      };
    }

    case 'kali-campuran': {
      const a = randomCampuran(3, 5);
      const b = randomCampuran(2, 5);
      const pbA = kePecahanBiasa(a);
      const pbB = kePecahanBiasa(b);
      const kaliPembilang = pbA.pembilang * pbB.pembilang;
      const kaliPenyebut = pbA.penyebut * pbB.penyebut;
      const sederhana = sederhanakan(kaliPembilang, kaliPenyebut);
      const hasil = keCampuran(sederhana.pembilang, sederhana.penyebut);
      const jawaban = formatCampuran(hasil);
      return {
        level,
        soal: `${formatCampuran(a)} × ${formatCampuran(b)} = ?`,
        jawaban,
        langkah: [
          `Ubah ke pecahan biasa:`,
          `${formatCampuran(a)} = ${pbA.pembilang}/${pbA.penyebut}`,
          `${formatCampuran(b)} = ${pbB.pembilang}/${pbB.penyebut}`,
          `Kalikan: (${pbA.pembilang} × ${pbB.pembilang}) / (${pbA.penyebut} × ${pbB.penyebut})`,
          `= ${kaliPembilang}/${kaliPenyebut}`,
          sederhana.pembilang !== kaliPembilang ? `Sederhanakan: ${sederhana.pembilang}/${sederhana.penyebut}` : '',
          `= ${jawaban}`
        ].filter(Boolean),
        tips: 'Ubah ke pecahan biasa, lalu pembilang × pembilang, penyebut × penyebut!',
        visual: { type: 'operasi', a, b, op: '×', hasil },
        opsi: [
          jawaban,
          formatCampuran(keCampuran(kaliPembilang + kaliPenyebut, kaliPenyebut)),
          formatCampuran({ bulat: a.bulat * b.bulat, pembilang: a.pembilang * b.pembilang, penyebut: a.penyebut * b.penyebut }),
          formatCampuran(keCampuran(kaliPembilang, kaliPenyebut + 1))
        ]
      };
    }

    case 'bagi-campuran': {
      const a = randomCampuran(3, 5);
      const b = randomCampuran(2, 5);
      const pbA = kePecahanBiasa(a);
      const pbB = kePecahanBiasa(b);
      const bagiPembilang = pbA.pembilang * pbB.penyebut;
      const bagiPenyebut = pbA.penyebut * pbB.pembilang;
      const sederhana = sederhanakan(bagiPembilang, bagiPenyebut);
      const hasil = keCampuran(sederhana.pembilang, sederhana.penyebut);
      const jawaban = formatCampuran(hasil);
      return {
        level,
        soal: `${formatCampuran(a)} ÷ ${formatCampuran(b)} = ?`,
        jawaban,
        langkah: [
          `Ubah ke pecahan biasa:`,
          `${formatCampuran(a)} = ${pbA.pembilang}/${pbA.penyebut}`,
          `${formatCampuran(b)} = ${pbB.pembilang}/${pbB.penyebut}`,
          `Balik pecahan kedua: ${pbB.penyebut}/${pbB.pembilang}`,
          `Kalikan: (${pbA.pembilang} × ${pbB.penyebut}) / (${pbA.penyebut} × ${pbB.pembilang})`,
          `= ${bagiPembilang}/${bagiPenyebut}`,
          sederhana.pembilang !== bagiPembilang ? `Sederhanakan: ${sederhana.pembilang}/${sederhana.penyebut}` : '',
          `= ${jawaban}`
        ].filter(Boolean),
        tips: 'Ubah ke pecahan biasa, balik pecahan kedua (pembilang jadi penyebut), lalu kalikan!',
        visual: { type: 'operasi', a, b, op: '÷', hasil },
        opsi: [
          jawaban,
          formatCampuran(keCampuran(pbA.pembilang * pbB.pembilang, pbA.penyebut * pbB.penyebut)),
          formatCampuran({ bulat: Math.floor(a.bulat / (b.bulat || 1)), pembilang: a.pembilang, penyebut: b.pembilang || 1 }),
          formatCampuran(keCampuran(bagiPembilang + 1, bagiPenyebut))
        ]
      };
    }

    case 'banding-campuran': {
      const a = randomCampuran(3, 6);
      const b = randomCampuran(3, 6);
      const nilaiA = a.bulat + a.pembilang / a.penyebut;
      const nilaiB = b.bulat + b.pembilang / b.penyebut;
      const lebihBesar = nilaiA > nilaiB ? 'A' : nilaiB > nilaiA ? 'B' : 'SAMA';
      return {
        level,
        soal: `Mana yang lebih BESAR?\nA) ${formatCampuran(a)}\nB) ${formatCampuran(b)}`,
        jawaban: lebihBesar,
        langkah: [
          `A: ${formatCampuran(a)} = ${nilaiA.toFixed(3)}`,
          `B: ${formatCampuran(b)} = ${nilaiB.toFixed(3)}`,
          lebihBesar === 'SAMA' ? 'Keduanya sama besar!' : `${lebihBesar} lebih besar!`
        ],
        tips: 'Ubah ke desimal atau samakan penyebut untuk membandingkan!',
        visual: { type: 'perbandingan', a, b, nilaiA, nilaiB },
        opsi: ['A', 'B', 'SAMA']
      };
    }

    case 'cerita-dapur': {
      const stories = [
        {
          soal: 'Resep kue butuh 2 1/4 gelas tepung. Koki punya 1 3/4 gelas. Kurang berapa?',
          a: { bulat: 2, pembilang: 1, penyebut: 4 },
          b: { bulat: 1, pembilang: 3, penyebut: 4 },
          op: '-' as const,
          jawaban: '1/2'
        },
        {
          soal: 'Koki membuat 3 adonan. Setiap adonan butuh 1 1/3 gelas susu. Total susu?',
          a: { bulat: 1, pembilang: 1, penyebut: 3 },
          b: { bulat: 3, pembilang: 0, penyebut: 1 },
          op: '×' as const,
          jawaban: '4'
        },
        {
          soal: 'Kue dipotong 3 1/2 bagian sama besar. Setiap bagian berapa? (dari 1 kue utuh)',
          a: { bulat: 1, pembilang: 0, penyebut: 1 },
          b: { bulat: 3, pembilang: 1, penyebut: 2 },
          op: '÷' as const,
          jawaban: '2/7'
        },
      ];
      const story = stories[Math.floor(Math.random() * stories.length)];
      return {
        level,
        soal: story.soal,
        jawaban: story.jawaban,
        langkah: [
          `Diketahui: ${formatCampuran(story.a)} dan ${formatCampuran(story.b)}`,
          `Operasi: ${story.op}`,
          story.op === '-' 
            ? `${formatCampuran(story.a)} - ${formatCampuran(story.b)} = ${story.jawaban}`
            : story.op === '×'
              ? `${formatCampuran(story.a)} × ${story.b.bulat} = ${story.jawaban}`
              : `${formatCampuran(story.a)} ÷ ${formatCampuran(story.b)} = ${story.jawaban}`
        ],
        tips: 'Baca soal dengan teliti. Tentukan operasi yang tepat!',
        visual: { type: 'cerita', ...story },
        opsi: [
          story.jawaban,
          story.op === '-' ? formatCampuran({ bulat: story.a.bulat - story.b.bulat, pembilang: Math.abs(story.a.pembilang - story.b.pembilang), penyebut: story.a.penyebut }) :
          story.op === '×' ? formatCampuran(keCampuran((story.a.bulat * story.a.penyebut + story.a.pembilang) * story.b.bulat + 1, story.a.penyebut)) :
          formatCampuran(keCampuran(story.a.penyebut * story.b.penyebut + 1, story.a.pembilang * story.b.penyebut)),
          story.jawaban + '/1',
          story.jawaban + '/2'
        ]
      };
    }
  }
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function MixFractionKitchen({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [currentLevel, setCurrentLevel] = useState<LevelType>('campuran-ke-biasa');
  const [soal, setSoal] = useState<SoalDapur | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [levelSoalCount, setLevelSoalCount] = useState(0);
  const [selectedBahan] = useState(BAHAN_DAPUR[Math.floor(Math.random() * BAHAN_DAPUR.length)]);
  const TOTAL_PER_LEVEL = 3;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateSoal(currentLevel));
      setSelected(null);
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
    }
  }, [soalIndex, currentLevel, step]);

  const handleAnswer = (ans: string) => {
    if (answered || !soal) return;
    setSelected(ans);
    setAnswered(true);
    const ok = ans.toLowerCase() === soal.jawaban.toLowerCase();
    setIsCorrect(ok);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else { setStreak(0); setShowSolution(true); }
  };

  const nextSoal = () => {
    const newCount = levelSoalCount + 1;
    if (newCount >= TOTAL_PER_LEVEL) {
      setLevelsCompleted(prev => new Set(prev).add(currentLevel));
      setLevelSoalCount(0);
      const newCompleted = new Set([...levelsCompleted, currentLevel]);
      if (newCompleted.size >= LEVELS.length) { setStep('complete'); return; }
      setSoalIndex(i => i + 1);
    } else {
      setLevelSoalCount(newCount);
      setSoalIndex(i => i + 1);
    }
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.langkah.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setLevelsCompleted(new Set()); setLevelSoalCount(0); setCurrentLevel('campuran-ke-biasa'); };
  const stars = levelsCompleted.size >= 7 ? 3 : levelsCompleted.size >= 5 ? 2 : levelsCompleted.size >= 3 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🍕</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>👨‍🍳🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Chef!' : stars === 2 ? 'Koki Handal!' : 'Koki Pemula!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#f59e0b', margin: 0 }}>Skor: {score}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>Level: {levelsCompleted.size}/{LEVELS.length}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, levelsCompleted: Array.from(levelsCompleted) })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>👨‍🍳</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>MixFraction Kitchen</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Game Bilangan Campuran di Dapur!</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {LEVELS.map(l => (
            <div key={l.id} style={{ background: l.bg, borderRadius: '10px', padding: '8px', textAlign: 'center', border: `1px solid ${l.color}40` }}>
              <div style={{ fontSize: '22px' }}>{l.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: l.color }}>{l.label}</div>
              <div style={{ fontSize: '8px', color: '#6b7280' }}>{l.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#92400e', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🍕 Materi:</strong><br/>
          ✅ Konversi campuran ↔ pecahan biasa<br/>
          ✅ Operasi + − × ÷ bilangan campuran<br/>
          ✅ Membandingkan & soal cerita dapur
        </div>

        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
          🍳 Mulai Masak!
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
          <span style={{ fontSize: '10px', color: '#6b7280' }}>{levelSoalCount + 1}/{TOTAL_PER_LEVEL}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: '#f59e0b' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Level Progress */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
        {LEVELS.map(l => (
          <div key={l.id} style={{ flex: 1, height: '3px', borderRadius: '2px', background: levelsCompleted.has(l.id) ? l.color : '#e5e7eb' }} />
        ))}
      </div>

      {/* Dapur Visual */}
      <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '10px', marginBottom: '10px', border: '2px solid #fbbf2430' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '28px' }}>
          <span>🍳</span>
          <span>{selectedBahan.emoji}</span>
          <span>🥣</span>
          <span>🔥</span>
        </div>
        <p style={{ fontSize: '11px', color: '#92400e', fontWeight: '600', marginTop: '4px' }}>
          Dapur {selectedBahan.nama} • {selectedBahan.satuan}
        </p>
      </div>

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${levelConfig.color}20` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: levelConfig.color, fontWeight: '600', marginTop: '8px', background: levelConfig.bg, borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Options */}
      {soal.opsi && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '280px', margin: '0 auto' }}>
          {soal.opsi.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrectAnswer = opt === soal.jawaban;
            const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
            const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
                style={{ padding: '12px', fontSize: '15px', fontWeight: '900', borderRadius: '10px', border: 'none', background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

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
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${soal.jawaban}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#f59e0b', color: '#fff', cursor: 'pointer' }}>
            {levelSoalCount < TOTAL_PER_LEVEL - 1 ? 'Lanjut ➡️' : 'Level Selesai 🎉'}
          </button>
        </div>
      )}
    </div>
  );
}