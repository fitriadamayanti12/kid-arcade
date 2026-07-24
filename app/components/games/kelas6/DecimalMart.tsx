// app/components/games/kelas6/DecimalMart.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TIPE LEVEL & KESULITAN
// ============================================
type LevelType = 
  | 'total-belanja'
  | 'kembalian'
  | 'diskon-persen'
  | 'timbang-buah'
  | 'banding-harga'
  | 'beli-banyak'
  | 'pecah-uang'
  | 'cerita-belajar';

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
  { id: 'total-belanja', label: 'Total Belanja', icon: '🧾', color: '#3b82f6', bg: '#eff6ff', desc: 'Jumlahkan harga barang', unlock: 0 },
  { id: 'kembalian', label: 'Kembalian', icon: '💵', color: '#10b981', bg: '#ecfdf5', desc: 'Hitung uang kembali', unlock: 2 },
  { id: 'diskon-persen', label: 'Diskon %', icon: '🏷️', color: '#ef4444', bg: '#fef2f2', desc: 'Hitung diskon & harga akhir', unlock: 4 },
  { id: 'timbang-buah', label: 'Timbang Buah', icon: '⚖️', color: '#f59e0b', bg: '#fffbeb', desc: 'Desimal ke pecahan', unlock: 6 },
  { id: 'banding-harga', label: 'Banding Harga', icon: '📊', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Mana lebih murah?', unlock: 8 },
  { id: 'beli-banyak', label: 'Beli Banyak', icon: '📦', color: '#ec4899', bg: '#fdf2f8', desc: 'Perkalian desimal', unlock: 10 },
  { id: 'pecah-uang', label: 'Pecah Uang', icon: '🪙', color: '#06b6d4', bg: '#ecfeff', desc: 'Pembagian desimal', unlock: 12 },
  { id: 'cerita-belajar', label: 'Cerita Belanja', icon: '📖', color: '#f97316', bg: '#fff7ed', desc: 'Soal cerita lengkap', unlock: 14 },
];

// ============================================
// DATA BARANG SUPERMARKET
// ============================================
interface BarangItem {
  nama: string;
  harga: number;
  emoji: string;
}

const BARANG: BarangItem[] = [
  { nama: 'Beras 1kg', harga: 12.5, emoji: '🍚' },
  { nama: 'Minyak Goreng', harga: 14.0, emoji: '🫗' },
  { nama: 'Telur 1 butir', harga: 2.5, emoji: '🥚' },
  { nama: 'Gula 1kg', harga: 8.5, emoji: '🍬' },
  { nama: 'Susu Kotak', harga: 6.75, emoji: '🥛' },
  { nama: 'Roti', harga: 5.5, emoji: '🍞' },
  { nama: 'Sabun Mandi', harga: 3.25, emoji: '🧼' },
  { nama: 'Sampo', harga: 9.9, emoji: '🧴' },
  { nama: 'Mie Instan', harga: 3.5, emoji: '🍜' },
  { nama: 'Kopi Sachet', harga: 2.75, emoji: '☕' },
  { nama: 'Coklat Batang', harga: 7.25, emoji: '🍫' },
  { nama: 'Keju', harga: 11.5, emoji: '🧀' },
  { nama: 'Apel 1 buah', harga: 4.5, emoji: '🍎' },
  { nama: 'Jeruk 1 buah', harga: 3.75, emoji: '🍊' },
  { nama: 'Pisang 1 sisir', harga: 6.25, emoji: '🍌' },
];

interface BuahTimbang {
  nama: string;
  hargaPerKg: number;
  emoji: string;
}

const BUAH_TIMBANG: BuahTimbang[] = [
  { nama: 'Apel', hargaPerKg: 15.0, emoji: '🍎' },
  { nama: 'Jeruk', hargaPerKg: 12.5, emoji: '🍊' },
  { nama: 'Anggur', hargaPerKg: 25.0, emoji: '🍇' },
  { nama: 'Mangga', hargaPerKg: 18.0, emoji: '🥭' },
  { nama: 'Pisang', hargaPerKg: 10.0, emoji: '🍌' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const bulatkan = (n: number, desimal: number = 2): number => {
  const factor = Math.pow(10, desimal);
  return Math.round(n * factor) / factor;
};

const toRupiah = (val: number | string): string => {
  if (typeof val === 'number') return `Rp${val.toFixed(2)}`;
  return `Rp${val}`;
};

const toDisplay = (val: number | string, desimal: number = 2): string => {
  if (typeof val === 'number') return val.toFixed(desimal);
  return String(val);
};

const desimalKePecahan = (d: number): { pembilang: number; penyebut: number } => {
  const str = d.toString();
  const desimalPart = str.includes('.') ? str.split('.')[1] : '';
  const penyebut = Math.pow(10, desimalPart.length);
  const pembilang = Math.round(d * penyebut);
  
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const fpb = gcd(pembilang, penyebut);
  return { pembilang: pembilang / fpb, penyebut: penyebut / fpb };
};

// ============================================
// GENERATOR SOAL PER LEVEL
// ============================================
interface SoalDecimal {
  level: LevelType;
  soal: string;
  jawaban: number | string;
  langkah: string[];
  tips: string;
  visual: any;
  opsi?: (number | string)[];
  satuan: string;
}

const generateSoal = (level: LevelType): SoalDecimal => {
  switch (level) {
    case 'total-belanja': {
      const items: BarangItem[] = [];
      const count = Math.floor(Math.random() * 3) + 2;
      const used = new Set<number>();
      while (items.length < count) {
        const idx = Math.floor(Math.random() * BARANG.length);
        if (!used.has(idx)) {
          used.add(idx);
          items.push(BARANG[idx]);
        }
      }
      const total = bulatkan(items.reduce((sum, item) => sum + item.harga, 0));
      return {
        level,
        soal: `Hitung total belanjaan di keranjang!`,
        jawaban: total,
        langkah: [
          ...items.map(item => `${item.emoji} ${item.nama}: Rp${item.harga.toFixed(2)}`),
          `--------------------------------`,
          `Total = ${items.map(i => i.harga).join(' + ')}`,
          `= ${toRupiah(total)}`
        ],
        tips: 'Jumlahkan semua harga. Sejajarkan koma desimal!',
        visual: { type: 'keranjang' as const, items },
        satuan: 'rupiah'
      };
    }

    case 'kembalian': {
      const items: BarangItem[] = [];
      const count = Math.floor(Math.random() * 3) + 2;
      const used = new Set<number>();
      while (items.length < count) {
        const idx = Math.floor(Math.random() * BARANG.length);
        if (!used.has(idx)) {
          used.add(idx);
          items.push(BARANG[idx]);
        }
      }
      const total = bulatkan(items.reduce((sum, item) => sum + item.harga, 0));
      const pecahanUang = [20, 50, 100];
      let uangDibayar = pecahanUang[Math.floor(Math.random() * pecahanUang.length)];
      while (uangDibayar <= total) {
        uangDibayar = pecahanUang[Math.floor(Math.random() * pecahanUang.length)];
      }
      const kembalian = bulatkan(uangDibayar - total);
      return {
        level,
        soal: `Total: ${toRupiah(total)}. Bayar: Rp${uangDibayar}.000. Kembalian?`,
        jawaban: kembalian,
        langkah: [
          `Total belanja = ${toRupiah(total)}`,
          `Uang dibayar = Rp${uangDibayar}.000`,
          `Kembalian = Rp${uangDibayar}.000 - ${toRupiah(total)}`,
          `= ${toRupiah(kembalian)}`
        ],
        tips: 'Kembalian = uang dibayar - total belanja. Hitung yang teliti!',
        visual: { type: 'pembayaran' as const, total, uangDibayar, kembalian },
        satuan: 'rupiah'
      };
    }

    case 'diskon-persen': {
      const item = BARANG[Math.floor(Math.random() * BARANG.length)];
      const diskonPersen = [10, 15, 20, 25, 30, 50][Math.floor(Math.random() * 6)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const totalAwal = bulatkan(item.harga * qty);
      const diskonRupiah = bulatkan(totalAwal * diskonPersen / 100);
      const totalAkhir = bulatkan(totalAwal - diskonRupiah);
      return {
        level,
        soal: `${item.emoji} ${item.nama}: Rp${item.harga.toFixed(2)} × ${qty}\nDiskon ${diskonPersen}%. Harga akhir?`,
        jawaban: totalAkhir,
        langkah: [
          `Harga awal = ${qty} × Rp${item.harga.toFixed(2)} = ${toRupiah(totalAwal)}`,
          `Diskon = ${diskonPersen}% × ${toRupiah(totalAwal)}`,
          `= ${diskonPersen}/100 × ${toRupiah(totalAwal)} = ${toRupiah(diskonRupiah)}`,
          `Harga akhir = ${toRupiah(totalAwal)} - ${toRupiah(diskonRupiah)}`,
          `= ${toRupiah(totalAkhir)}`
        ],
        tips: `Diskon ${diskonPersen}% = potongan ${diskonPersen}/100 × harga. Harga akhir = harga - diskon!`,
        visual: { type: 'diskon' as const, item, qty, diskonPersen, totalAwal, diskonRupiah, totalAkhir },
        satuan: 'rupiah'
      };
    }

    case 'timbang-buah': {
      const buah = BUAH_TIMBANG[Math.floor(Math.random() * BUAH_TIMBANG.length)];
      const berat = bulatkan(Math.random() * 2 + 0.5, 1);
      const total = bulatkan(buah.hargaPerKg * berat);
      const pecahan = desimalKePecahan(berat);
      return {
        level,
        soal: `${buah.emoji} ${buah.nama}: Rp${buah.hargaPerKg.toFixed(2)}/kg\nBerat: ${berat} kg. Total harga?`,
        jawaban: total,
        langkah: [
          `${berat} kg = ${pecahan.pembilang}/${pecahan.penyebut} kg`,
          `Harga = ${berat} × Rp${buah.hargaPerKg.toFixed(2)}`,
          `= ${toRupiah(total)}`
        ],
        tips: `${berat} = ${pecahan.pembilang}/${pecahan.penyebut}. Kalikan berat dengan harga per kg!`,
        visual: { type: 'timbangan' as const, buah, berat, total },
        satuan: 'rupiah'
      };
    }

    case 'banding-harga': {
      const item1 = BARANG[Math.floor(Math.random() * BARANG.length)];
      let item2 = BARANG[Math.floor(Math.random() * BARANG.length)];
      while (item2.nama === item1.nama) {
        item2 = BARANG[Math.floor(Math.random() * BARANG.length)];
      }
      const lebihMurah = item1.harga < item2.harga ? 0 : item2.harga < item1.harga ? 1 : 2;
      const selisih = bulatkan(Math.abs(item1.harga - item2.harga));
      return {
        level,
        soal: `Mana yang lebih MURAH?\nA) ${item1.emoji} ${item1.nama}: Rp${item1.harga.toFixed(2)}\nB) ${item2.emoji} ${item2.nama}: Rp${item2.harga.toFixed(2)}`,
        jawaban: lebihMurah === 0 ? 'A' : lebihMurah === 1 ? 'B' : 'SAMA',
        langkah: [
          `A: Rp${item1.harga.toFixed(2)}`,
          `B: Rp${item2.harga.toFixed(2)}`,
          lebihMurah === 2 
            ? 'Keduanya sama!' 
            : `${lebihMurah === 0 ? 'A' : 'B'} lebih murah. Selisih = Rp${selisih.toFixed(2)}`
        ],
        tips: 'Bandingkan angka dari kiri. Perhatikan koma desimal!',
        visual: { type: 'perbandingan' as const, item1, item2 },
        satuan: '',
        opsi: ['A', 'B', 'SAMA']
      };
    }

    case 'beli-banyak': {
      const item = BARANG[Math.floor(Math.random() * BARANG.length)];
      const qty = Math.floor(Math.random() * 5) + 3;
      const total = bulatkan(item.harga * qty);
      return {
        level,
        soal: `${item.emoji} ${item.nama}: Rp${item.harga.toFixed(2)}/buah\nBeli ${qty} buah. Total?`,
        jawaban: total,
        langkah: [
          `Harga per buah = Rp${item.harga.toFixed(2)}`,
          `Total = ${qty} × Rp${item.harga.toFixed(2)}`,
          `= ${toRupiah(total)}`
        ],
        tips: 'Perkalian desimal: kalikan seperti biasa, lalu hitung jumlah angka di belakang koma!',
        visual: { type: 'beli-banyak' as const, item, qty, total },
        satuan: 'rupiah'
      };
    }

    case 'pecah-uang': {
      const totalUang = [50, 100, 150, 200][Math.floor(Math.random() * 4)];
      const jumlahOrang = Math.floor(Math.random() * 3) + 2;
      const perOrang = bulatkan(totalUang / jumlahOrang);
      return {
        level,
        soal: `Rp${totalUang}.000 dibagi ke ${jumlahOrang} orang sama rata.\nMasing-masing dapat?`,
        jawaban: perOrang,
        langkah: [
          `Total = Rp${totalUang}.000`,
          `Dibagi ${jumlahOrang} orang`,
          `= Rp${totalUang}.000 ÷ ${jumlahOrang}`,
          `= ${toRupiah(perOrang)} per orang`
        ],
        tips: 'Pembagian desimal: bagi seperti biasa. Kalau ada sisa, tambahkan 0 di belakang koma!',
        visual: { type: 'pecah-uang' as const, totalUang, jumlahOrang, perOrang },
        satuan: 'rupiah'
      };
    }

    case 'cerita-belajar': {
      const stories = [
        {
          soal: 'Ibu beli beras Rp12.500, minyak Rp14.000, dan telur 4 butir @Rp2.500. Total?',
          jawaban: 36.5,
          langkah: [
            'Beras: Rp12.500',
            'Minyak: Rp14.000',
            'Telur: 4 × Rp2.500 = Rp10.000',
            'Total = 12.500 + 14.000 + 10.000 = Rp36.500'
          ]
        },
        {
          soal: 'Andi punya Rp50.000. Beli susu Rp6.750 dan roti Rp5.500. Kembalian?',
          jawaban: 37.75,
          langkah: [
            'Susu + Roti = Rp6.750 + Rp5.500 = Rp12.250',
            'Kembalian = Rp50.000 - Rp12.250 = Rp37.750'
          ]
        },
        {
          soal: 'Harga baju Rp150.000 diskon 20%. Harga setelah diskon?',
          jawaban: 120,
          langkah: [
            'Diskon = 20% × Rp150.000 = Rp30.000',
            'Harga akhir = Rp150.000 - Rp30.000 = Rp120.000'
          ]
        },
      ];
      const story = stories[Math.floor(Math.random() * stories.length)];
      return {
        level,
        soal: story.soal,
        jawaban: story.jawaban,
        langkah: story.langkah,
        tips: 'Baca soal dengan teliti. Tentukan operasi yang tepat!',
        visual: { type: 'cerita' as const, text: story.soal },
        satuan: 'rupiah'
      };
    }

    default:
      return {
        level: 'total-belanja',
        soal: 'Soal tidak tersedia',
        jawaban: 0,
        langkah: [],
        tips: '',
        visual: { type: 'keranjang' as const, items: [] },
        satuan: ''
      };
  }
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function DecimalMart({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [currentLevel, setCurrentLevel] = useState<LevelType>('total-belanja');
  const [soal, setSoal] = useState<SoalDecimal | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const TOTAL_PER_LEVEL = 3;
  const [levelSoalCount, setLevelSoalCount] = useState(0);

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateSoal(currentLevel));
      setSelected(null);
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
      setInputAnswer('');
    }
  }, [soalIndex, currentLevel, step]);

  const handleAnswer = (ans: string | number) => {
    if (answered || !soal) return;
    setSelected(ans);
    setAnswered(true);
    const ansStr = String(ans).toLowerCase();
    const jawabanStr = String(soal.jawaban).toLowerCase();
    const ok = ansStr === jawabanStr || 
               (soal.satuan === 'rupiah' && typeof soal.jawaban === 'number' && typeof ans === 'number' && Math.abs(ans - soal.jawaban) < 0.01);
    setIsCorrect(ok);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
      setShowSolution(true);
    }
  };

  const nextSoal = () => {
    const newCount = levelSoalCount + 1;
    if (newCount >= TOTAL_PER_LEVEL) {
      setLevelsCompleted(prev => new Set(prev).add(currentLevel));
      setLevelSoalCount(0);
      const newCompleted = new Set([...levelsCompleted, currentLevel]);
      if (newCompleted.size >= LEVELS.length) {
        setStep('complete');
        return;
      }
    } else {
      setLevelSoalCount(newCount);
    }
    setSoalIndex(i => i + 1);
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.langkah.length - 1) setSolutionStep(s => s + 1);
  };

  const start = () => { 
    setStep('play'); 
    setScore(0); 
    setSoalIndex(0); 
    setStreak(0); 
    setLevelsCompleted(new Set());
    setLevelSoalCount(0);
    setCurrentLevel('total-belanja');
  };

  const stars = levelsCompleted.size >= 7 ? 3 : levelsCompleted.size >= 5 ? 2 : levelsCompleted.size >= 3 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🛒</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Manajer Supermarket!' : stars === 2 ? 'Kasir Handal!' : 'Kasir Pemula!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#10b981', margin: 0 }}>Skor: {score}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>Level selesai: {levelsCompleted.size}/{LEVELS.length}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, levelsCompleted: Array.from(levelsCompleted) })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>🛒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>DecimalMart</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Game Desimal Supermarket!</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {LEVELS.map(l => (
            <div key={l.id} style={{ 
              background: l.bg, borderRadius: '10px', padding: '8px', textAlign: 'center', 
              border: `1px solid ${l.color}40`, opacity: score >= l.unlock || l.unlock === 0 ? 1 : 0.5 
            }}>
              <div style={{ fontSize: '22px' }}>{l.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: l.color }}>{l.label}</div>
              <div style={{ fontSize: '8px', color: '#6b7280' }}>{l.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
          🛒 Mulai Belanja!
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
          <span style={{ color: '#10b981' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Visual Keranjang */}
      {soal.visual.type === 'keranjang' && soal.visual.items && soal.visual.items.length > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '10px', marginBottom: '10px', border: '1px solid #fbbf2420' }}>
          <p style={{ fontSize: '11px', color: '#92400e', fontWeight: '600', marginBottom: '6px' }}>🛒 KERANJANG BELANJA</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {(soal.visual.items as BarangItem[]).map((item: BarangItem, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 8px', background: '#fff', borderRadius: '6px' }}>
                <span>{item.emoji} {item.nama}</span>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>Rp{item.harga.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Diskon */}
      {soal.visual.type === 'diskon' && (
        <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '36px' }}>{(soal.visual as any).item?.emoji}</span>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>-{(soal.visual as any).diskonPersen}%</div>
          <div style={{ fontSize: '11px', color: '#991b1b' }}>
            {toRupiah((soal.visual as any).totalAwal)} → <span style={{ fontWeight: '700' }}>{toRupiah((soal.visual as any).totalAkhir)}</span>
          </div>
        </div>
      )}

      {/* Visual Timbangan */}
      {soal.visual.type === 'timbangan' && (
        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
          <div style={{ fontSize: '40px' }}>⚖️{(soal.visual as any).buah?.emoji}</div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>{(soal.visual as any).berat} kg</div>
        </div>
      )}

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${levelConfig.color}20` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: levelConfig.color, fontWeight: '600', marginTop: '8px', background: levelConfig.bg, borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Answer */}
      {soal.opsi && soal.opsi.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '240px', margin: '0 auto' }}>
          {soal.opsi.map((opt: string | number, i: number) => {
            const isSelected = String(selected) === String(opt);
            const isCorrectAnswer = String(opt) === String(soal.jawaban);
            const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
            const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
                style={{ padding: '12px', fontSize: '16px', fontWeight: '900', borderRadius: '10px', border: 'none', background: bg, color, cursor: answered ? 'default' : 'pointer' }}>
                {String(opt)}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <input type="text" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnswer(inputAnswer)}
            placeholder={soal.satuan === 'rupiah' ? 'Rp...' : 'Jawaban'} disabled={answered} autoFocus
            style={{ padding: '10px', fontSize: '15px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${answered ? (isCorrect ? '#10b981' : '#ef4444') : '#d1d5db'}`, width: '130px', outline: 'none', background: '#fff' }} />
          <button onClick={() => handleAnswer(inputAnswer)} disabled={answered || !inputAnswer}
            style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>✅</button>
        </div>
      )}

      {/* Solution */}
      {showSolution && soal && (
        <div style={{ marginTop: '10px', background: '#fef3c7', borderRadius: '10px', padding: '10px', textAlign: 'left', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>💡 LANGKAH:</p>
          {soal.langkah.slice(0, solutionStep + 1).map((step: string, i: number) => (
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
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${typeof soal.jawaban === 'number' && soal.satuan === 'rupiah' ? toRupiah(soal.jawaban) : soal.jawaban}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#3b82f6', color: '#fff', cursor: 'pointer' }}>
            {levelSoalCount < TOTAL_PER_LEVEL - 1 ? 'Lanjut ➡️' : 'Level Selesai 🎉'}
          </button>
        </div>
      )}
    </div>
  );
}