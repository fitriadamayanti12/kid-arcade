// app/components/games/kelas6/MathMaster6.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TOPIK LENGKAP KELAS 6
// ============================================
type TopicId = 
  | 'bil-bulat' 
  | 'bil-campuran' 
  | 'desimal' 
  | 'rasio' 
  | 'aljabar' 
  | 'geometri' 
  | 'statistik' 
  | 'peluang' 
  | 'skala';

interface TopicConfig {
  id: TopicId;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  desc: string;
}

const TOPICS: TopicConfig[] = [
  { id: 'bil-bulat', label: 'Bilangan Bulat', emoji: '➕➖', color: '#ef4444', bg: '#fef2f2', desc: 'Positif, negatif, operasi' },
  { id: 'bil-campuran', label: 'Bilangan Campuran', emoji: '🧮', color: '#f59e0b', bg: '#fffbeb', desc: 'Pecahan campuran & biasa' },
  { id: 'desimal', label: 'Desimal', emoji: '💯', color: '#10b981', bg: '#ecfdf5', desc: 'Operasi & konversi' },
  { id: 'rasio', label: 'Rasio & Proporsi', emoji: '⚖️', color: '#3b82f6', bg: '#eff6ff', desc: 'Perbandingan & skala' },
  { id: 'aljabar', label: 'Aljabar', emoji: '❓', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Persamaan sederhana' },
  { id: 'geometri', label: 'Geometri', emoji: '📐', color: '#06b6d4', bg: '#ecfeff', desc: 'Bangun ruang & datar' },
  { id: 'statistik', label: 'Statistik', emoji: '📊', color: '#ec4899', bg: '#fdf2f8', desc: 'Mean, median, modus' },
  { id: 'peluang', label: 'Peluang', emoji: '🎲', color: '#f97316', bg: '#fff7ed', desc: 'Kemungkinan kejadian' },
  { id: 'skala', label: 'Skala', emoji: '🗺️', color: '#14b8a6', bg: '#f0fdfa', desc: 'Skala peta & denah' },
];

// ============================================
// INTERFACES
// ============================================
interface SoalItem {
  topik: TopicId;
  tipe: string;
  soal: string;
  jawaban: number | string;
  langkah: string[];
  tips: string;
  opsi?: (number | string)[];
}

// ============================================
// GENERATOR SOAL PER TOPIK
// ============================================
const bulatkan = (n: number, desimal: number = 0): number => {
  const factor = Math.pow(10, desimal);
  return Math.round(n * factor) / factor;
};

const generateSoal = (topik: TopicId): SoalItem => {
  switch (topik) {
    // ===== BILANGAN BULAT =====
    case 'bil-bulat': {
      const tipeRandom = Math.random();
      if (tipeRandom < 0.5) {
        // Operasi bilangan bulat
        const a = Math.floor(Math.random() * 20) - 10;
        const b = Math.floor(Math.random() * 20) - 10;
        const isTambah = Math.random() > 0.5;
        const jwb = isTambah ? a + b : a - b;
        return {
          topik,
          soal: `${a} ${isTambah ? '+' : '-'} (${b}) = ?`,
          jawaban: jwb,
          langkah: [
            `${a} ${isTambah ? '+' : '-'} (${b})`,
            isTambah 
              ? `= ${a + b}` 
              : `${a} - (${b}) = ${a} + ${-b} = ${jwb}`,
            `= ${jwb}`
          ],
          tips: isTambah ? 'Tambah bilangan negatif = kurangi' : 'Kurangi negatif = tambah positif!',
          tipe: 'operasi'
        };
      } else {
        // Suhu / cerita
        const suhuAwal = Math.floor(Math.random() * 16) - 8;
        const perubahan = Math.floor(Math.random() * 15) + 1;
        const naik = Math.random() > 0.5;
        const jwb = naik ? suhuAwal + perubahan : suhuAwal - perubahan;
        return {
          topik,
          soal: `Suhu ${suhuAwal}°C ${naik ? 'naik' : 'turun'} ${perubahan}°C. Suhu sekarang?`,
          jawaban: jwb,
          langkah: [
            `Suhu awal = ${suhuAwal}°C`,
            `${naik ? 'Naik' : 'Turun'} ${perubahan}°C`,
            `${suhuAwal} ${naik ? '+' : '-'} ${perubahan} = ${jwb}°C`
          ],
          tips: naik ? 'Naik = tambah. Suhu bisa negatif!' : 'Turun = kurang. Hati-hati dengan bilangan negatif!',
          tipe: 'cerita'
        };
      }
    }

    // ===== BILANGAN CAMPURAN =====
    case 'bil-campuran': {
      const tipeRandom = Math.random();
      if (tipeRandom < 0.5) {
        // Campuran ke pecahan biasa
        const bulat = Math.floor(Math.random() * 4) + 2;
        const pembilang = Math.floor(Math.random() * 3) + 1;
        const penyebut = pembilang + Math.floor(Math.random() * 4) + 2;
        const pecahanBiasa = bulat * penyebut + pembilang;
        return {
          topik,
          soal: `${bulat} ${pembilang}/${penyebut} = ... (pecahan biasa)`,
          jawaban: `${pecahanBiasa}/${penyebut}`,
          langkah: [
            `${bulat} ${pembilang}/${penyebut}`,
            `= (${bulat} × ${penyebut} + ${pembilang}) / ${penyebut}`,
            `= (${bulat * penyebut} + ${pembilang}) / ${penyebut}`,
            `= ${pecahanBiasa}/${penyebut}`
          ],
          tips: 'Kalikan bilangan bulat dengan penyebut, lalu tambah pembilang.',
          tipe: 'konversi',
          opsi: [
            `${pecahanBiasa}/${penyebut}`,
            `${pecahanBiasa + 1}/${penyebut}`,
            `${pembilang}/${penyebut * bulat}`,
            `${bulat * penyebut}/${pembilang}`
          ]
        };
      } else {
        // Operasi campuran
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 3) + 1;
        const c = Math.floor(Math.random() * 3) + 2;
        const d = c; // penyebut sama
        const hasilPembilang = a * d + b;
        return {
          topik,
          soal: `${a} ${b}/${d} = ... /${d}`,
          jawaban: `${hasilPembilang}/${d}`,
          langkah: [
            `${a} ${b}/${d}`,
            `= (${a} × ${d} + ${b}) / ${d}`,
            `= ${hasilPembilang}/${d}`
          ],
          tips: 'Untuk operasi, ubah dulu ke pecahan biasa!',
          tipe: 'operasi',
          opsi: [
            `${hasilPembilang}/${d}`,
            `${a * b}/${d}`,
            `${a + b}/${d}`,
            `${hasilPembilang + 1}/${d}`
          ]
        };
      }
    }

    // ===== DESIMAL =====
    case 'desimal': {
      const a = bulatkan(Math.random() * 8 + 1, 1);
      const b = bulatkan(Math.random() * 5 + 1, 1);
      const isTambah = Math.random() > 0.5;
      const jwb = bulatkan(isTambah ? a + b : a - b, 1);
      return {
        topik,
        soal: `${a} ${isTambah ? '+' : '-'} ${b} = ?`,
        jawaban: jwb,
        langkah: [
          `Sejajarkan koma desimal:`,
          `  ${a}`,
          `${isTambah ? '+' : '-'} ${b}`,
          `  ----`,
          `  ${jwb}`
        ],
        tips: 'Sejajarkan koma desimal saat menjumlah/mengurangi!',
        tipe: 'operasi'
      };
    }

    // ===== RASIO =====
    case 'rasio': {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const multiplier = Math.floor(Math.random() * 3) + 2;
      const jwb = a * multiplier;
      return {
        topik,
        soal: `${a} : ${b} = ? : ${b * multiplier}. Cari nilai ?`,
        jawaban: jwb,
        langkah: [
          `${a} : ${b} = ? : ${b * multiplier}`,
          `Kedua sisi dikali ${multiplier}`,
          `? = ${a} × ${multiplier} = ${jwb}`
        ],
        tips: 'Rasio senilai: kalikan/pembagi harus sama untuk kedua sisi!',
        tipe: 'senilai'
      };
    }

    // ===== ALJABAR =====
    case 'aljabar': {
      const x = Math.floor(Math.random() * 10) + 2;
      const coef = Math.floor(Math.random() * 3) + 2;
      const konstanta = Math.floor(Math.random() * 8) + 3;
      const hasil = coef * x + konstanta;
      return {
        topik,
        soal: `${coef}x + ${konstanta} = ${hasil}. x = ?`,
        jawaban: x,
        langkah: [
          `${coef}x + ${konstanta} = ${hasil}`,
          `${coef}x = ${hasil} - ${konstanta}`,
          `${coef}x = ${hasil - konstanta}`,
          `x = ${hasil - konstanta} ÷ ${coef}`,
          `x = ${x}`
        ],
        tips: 'Isolasi x: pindahkan konstanta, lalu bagi dengan koefisien!',
        tipe: 'linear'
      };
    }

    // ===== GEOMETRI =====
    case 'geometri': {
      const tipeRandom = Math.random();
      
      if (tipeRandom < 0.33) {
        // Kubus - Luas permukaan
        const s = Math.floor(Math.random() * 6) + 4;
        const jwb = 6 * s * s;
        return {
          topik,
          soal: `Kubus dengan sisi ${s} cm. Luas permukaan = ? cm²`,
          jawaban: jwb,
          langkah: [
            `Rumus LP Kubus = 6 × s × s`,
            `= 6 × ${s} × ${s}`,
            `= 6 × ${s * s}`,
            `= ${jwb} cm²`
          ],
          tips: 'Luas permukaan kubus = 6 × sisi × sisi. Jangan lupa satuan cm²!',
          tipe: 'kubus-lp'
        };
      } else if (tipeRandom < 0.66) {
        // Balok - Volume
        const p = Math.floor(Math.random() * 8) + 4;
        const l = Math.floor(Math.random() * 5) + 3;
        const t = Math.floor(Math.random() * 5) + 2;
        const jwb = p * l * t;
        return {
          topik,
          soal: `Balok ${p}×${l}×${t} cm. Volume = ? cm³`,
          jawaban: jwb,
          langkah: [
            `Rumus V Balok = p × l × t`,
            `= ${p} × ${l} × ${t}`,
            `= ${p * l} × ${t}`,
            `= ${jwb} cm³`
          ],
          tips: 'Volume balok = panjang × lebar × tinggi. Satuan cm³!',
          tipe: 'balok-vol'
        };
      } else {
        // Lingkaran - Luas
        const r = Math.floor(Math.random() * 7) + 3;
        const jwb = bulatkan(Math.PI * r * r, 0);
        return {
          topik,
          soal: `Lingkaran dengan r = ${r} cm. Luas = ? cm² (π ≈ 3,14)`,
          jawaban: jwb,
          langkah: [
            `Rumus L = π × r²`,
            `= 3,14 × ${r}²`,
            `= 3,14 × ${r * r}`,
            `= ${jwb} cm²`
          ],
          tips: 'Luas lingkaran = π × r². r² = r × r!',
          tipe: 'lingkaran-luas'
        };
      }
    }

    // ===== STATISTIK =====
    case 'statistik': {
      const data = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 5);
      const sorted = [...data].sort((a, b) => a - b);
      const jumlah = data.reduce((a, b) => a + b, 0);
      const mean = Math.round(jumlah / data.length);
      const median = (sorted[2] + sorted[3]) / 2;
      
      // Cari modus
      const frekuensi: Record<number, number> = {};
      data.forEach(d => frekuensi[d] = (frekuensi[d] || 0) + 1);
      const maxFrek = Math.max(...Object.values(frekuensi));
      const modus = Object.entries(frekuensi)
        .filter(([, v]) => v === maxFrek)
        .map(([k]) => Number(k))[0];
      
      const tipe = ['mean', 'median', 'modus'][Math.floor(Math.random() * 3)];
      const jwb = tipe === 'mean' ? mean : tipe === 'median' ? median : modus;
      
      return {
        topik,
        soal: `Data: ${data.join(', ')}. ${tipe === 'mean' ? 'Mean (rata-rata)' : tipe === 'median' ? 'Median (nilai tengah)' : 'Modus (paling sering)'} = ?`,
        jawaban: jwb,
        langkah: [
          `Data: ${data.join(', ')}`,
          tipe === 'mean' 
            ? `Jumlah = ${jumlah}, n = ${data.length}. Mean = ${jumlah}/${data.length} = ${mean}` 
            : tipe === 'median' 
              ? `Urut: ${sorted.join(', ')}. Median = (${sorted[2]} + ${sorted[3]})/2 = ${median}` 
              : `Frekuensi: ${Object.entries(frekuensi).map(([k, v]) => `${k}(${v}x)`).join(', ')}. Modus = ${modus}`,
          `= ${jwb}`
        ],
        tips: tipe === 'mean' ? 'Mean = jumlah ÷ banyak data' : tipe === 'median' ? 'Median = nilai tengah (data diurutkan dulu)' : 'Modus = nilai yang paling sering muncul',
        tipe
      };
    }

    // ===== PELUANG =====
    case 'peluang': {
      const total = Math.floor(Math.random() * 6) + 6;
      const favorable = Math.floor(Math.random() * 3) + 1;
      const objek = ['bola merah', 'kelereng biru', 'permen', 'kartu', 'pensil'][Math.floor(Math.random() * 5)];
      return {
        topik,
        soal: `Dalam kotak ada ${total} ${objek}. ${favorable} di antaranya berwarna merah. Peluang terambil merah?`,
        jawaban: `${favorable}/${total}`,
        langkah: [
          `Total kejadian = ${total}`,
          `Kejadian diinginkan (merah) = ${favorable}`,
          `Peluang = ${favorable}/${total}`
        ],
        tips: 'Peluang = kejadian diinginkan ÷ total kejadian. 0 ≤ peluang ≤ 1!',
        tipe: 'dasar',
        opsi: [`${favorable}/${total}`, `${total}/${favorable}`, `${favorable}/${total + favorable}`, `${total - favorable}/${total}`]
      };
    }

    // ===== SKALA =====
    case 'skala': {
      const skala = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
      const jarakPeta = Math.floor(Math.random() * 6) + 3;
      const jarakSebenarnyaCm = jarakPeta * skala;
      const jwb = jarakSebenarnyaCm / 100; // ke meter
      return {
        topik,
        soal: `Skala 1:${skala}. Jarak pada peta ${jarakPeta} cm. Jarak sebenarnya = ? meter`,
        jawaban: jwb,
        langkah: [
          `Skala 1:${skala} → 1 cm peta = ${skala} cm sebenarnya`,
          `Jarak sebenarnya = ${jarakPeta} × ${skala} cm`,
          `= ${jarakSebenarnyaCm} cm`,
          `= ${jarakSebenarnyaCm} ÷ 100 = ${jwb} meter`
        ],
        tips: 'Jarak sebenarnya = jarak peta × skala. Ubah cm ke m ÷ 100!',
        tipe: 'jarak'
      };
    }

    default:
      return {
        topik: 'bil-bulat',
        soal: 'Soal tidak tersedia',
        jawaban: 0,
        langkah: [],
        tips: '',
        tipe: ''
      };
  }
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function MathMaster6({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<SoalItem | null>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [topikMastered, setTopikMastered] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const TOTAL = 18;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play' && soalIndex < TOTAL) {
      const topikUrut = TOPICS.map(t => t.id);
      const topikSekarang = topikUrut[soalIndex % topikUrut.length];
      setSoal(generateSoal(topikSekarang));
      setSelected(null);
      setAnswered(false);
      setShowSolution(false);
      setSolutionStep(0);
      setInputAnswer('');
    }
  }, [soalIndex, step]);

  const handleAnswer = (ans: string | number) => {
    if (answered || !soal) return;
    setSelected(ans);
    setAnswered(true);
    const ok = String(ans).toLowerCase() === String(soal.jawaban).toLowerCase();
    setIsCorrect(ok);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      if (streak + 1 >= 2) setTopikMastered(prev => new Set(prev).add(soal.topik));
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

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); setTopikMastered(new Set()); };
  const stars = score >= 15 ? 3 : score >= 11 ? 2 : score >= 6 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🎓</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Kelas 6!' : stars === 2 ? 'Hampir Jago!' : 'Terus Semangat!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#7c3aed', margin: 0 }}>Skor: {score}/{TOTAL}</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>Topik dikuasai: {topikMastered.size}/{TOPICS.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
          {TOPICS.map(t => (
            <span key={t.id} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: topikMastered.has(t.id) ? t.bg : '#f3f4f6', color: topikMastered.has(t.id) ? t.color : '#9ca3af', fontWeight: '600' }}>
              {t.emoji} {topikMastered.has(t.id) ? '✅' : '⬜'}
            </span>
          ))}
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL, topikMastered: Array.from(topikMastered) })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '4px' }}>🎓</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>MathMaster 6</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Semua Materi Matematika Kelas 6!</p>
        
        {/* Grid Topik */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {TOPICS.map(t => (
            <div key={t.id} style={{ background: t.bg, borderRadius: '12px', padding: '10px 4px', textAlign: 'center', border: `1px solid ${t.color}30` }}>
              <div style={{ fontSize: '24px' }}>{t.emoji}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: t.color, marginTop: '2px' }}>{t.label}</div>
              <div style={{ fontSize: '8px', color: '#6b7280' }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#5b21b6', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>📋 Mencakup:</strong><br/>
          ✅ Bilangan bulat & campuran<br/>
          ✅ Desimal, rasio, aljabar<br/>
          ✅ Geometri, statistik, peluang, skala<br/>
          <strong>🎯 {TOTAL} soal</strong> • 2 soal per topik
        </div>

        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>
          🚀 Mulai Ujian!
        </button>
      </div>
    );
  }

  if (!soal) return null;
  const topikConfig = TOPICS.find(t => t.id === soal.topik)!;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: topikConfig.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span>{topikConfig.emoji}</span>
          <span style={{ fontWeight: '700', color: topikConfig.color }}>{topikConfig.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#7c3aed' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Topik Progress */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
        {TOPICS.map(t => (
          <div key={t.id} style={{ flex: 1, height: '3px', borderRadius: '2px', background: topikMastered.has(t.id) ? t.color : '#e5e7eb' }} />
        ))}
      </div>

      {/* Question Card */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: `2px solid ${topikConfig.color}20`, minHeight: '100px' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{soal.tipe.toUpperCase()}</p>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{soal.soal}</h3>
        <p style={{ fontSize: '11px', color: topikConfig.color, fontWeight: '600', marginTop: '8px', background: topikConfig.bg, borderRadius: '8px', padding: '6px 10px', display: 'inline-block' }}>💡 {soal.tips}</p>
      </div>

      {/* Answer Area */}
      {soal.opsi && soal.opsi.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
          {soal.opsi.map((opt: string | number, i: number) => {
            const isSelected = String(selected) === String(opt);
            const isCorrectAnswer = String(opt) === String(soal.jawaban);
            const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (answered && isCorrectAnswer ? '#10b981' : '#e5e7eb');
            const color = (isSelected || (answered && isCorrectAnswer)) ? '#fff' : '#1f2937';
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
                style={{ padding: '14px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', border: 'none', background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                {String(opt)}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <input type="text" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnswer(inputAnswer)}
            placeholder="Jawaban..." disabled={answered} autoFocus
            style={{ padding: '10px 14px', fontSize: '16px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${answered ? (isCorrect ? '#10b981' : '#ef4444') : '#d1d5db'}`, width: '120px', outline: 'none', background: '#fff' }} />
          <button onClick={() => handleAnswer(inputAnswer)} disabled={answered || !inputAnswer}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>✅</button>
        </div>
      )}

      {/* Solution Steps */}
      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 LANGKAH:</p>
          {soal.langkah.slice(0, solutionStep + 1).map((step: string, i: number) => (
            <p key={i} style={{ fontSize: '12px', color: '#92400e', margin: '3px 0', padding: '4px 8px', background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px', fontWeight: i === solutionStep ? '700' : '400', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent' }}>{i + 1}. {step}</p>
          ))}
          {solutionStep < soal.langkah.length - 1 && (
            <button onClick={revealStep} style={{ marginTop: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Lihat Langkah ➡️</button>
          )}
        </div>
      )}

      {/* Feedback & Next */}
      {answered && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', animation: 'pop 0.3s ease-out', background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b' }}>
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${soal.jawaban}`}
          </div>
          <button onClick={nextSoal} style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '999px', border: 'none', background: isCorrect ? '#10b981' : '#7c3aed', color: '#fff', cursor: 'pointer' }}>
            {soalIndex < TOTAL - 1 ? 'Soal Berikutnya ➡️' : '🏆 Lihat Hasil'}
          </button>
        </div>
      )}
    </div>
  );
}