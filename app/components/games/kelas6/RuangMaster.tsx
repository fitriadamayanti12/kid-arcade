// app/components/games/kelas6/RuangMaster.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// KONFIGURASI BANGUN RUANG
// ============================================
type BangunRuang = 'kubus' | 'balok' | 'prisma-segitiga' | 'tabung' | 'kerucut' | 'bola';

interface BangunRuangConfig {
  id: BangunRuang;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  rumusLP: string;
  rumusVol: string;
  deskripsi: string;
  tips: string;
}

const BANGUN_RUANG: Record<BangunRuang, BangunRuangConfig> = {
  'kubus': {
    id: 'kubus',
    label: 'Kubus',
    emoji: '🧊',
    color: '#3b82f6',
    bg: '#eff6ff',
    rumusLP: '6 × s × s',
    rumusVol: 's × s × s',
    deskripsi: '6 sisi persegi sama besar',
    tips: 'Semua rusuk sama panjang! s = rusuk'
  },
  'balok': {
    id: 'balok',
    label: 'Balok',
    emoji: '📦',
    color: '#10b981',
    bg: '#ecfdf5',
    rumusLP: '2 × (p×l + p×t + l×t)',
    rumusVol: 'p × l × t',
    deskripsi: '6 sisi persegi panjang',
    tips: 'p=panjang, l=lebar, t=tinggi'
  },
  'prisma-segitiga': {
    id: 'prisma-segitiga',
    label: 'Prisma Segitiga',
    emoji: '🔺',
    color: '#f59e0b',
    bg: '#fffbeb',
    rumusLP: '2×La + (keliling alas)×t',
    rumusVol: 'Luas alas × t',
    deskripsi: 'Alas segitiga, sisi tegak persegi panjang',
    tips: 'La = luas alas segitiga (½×a×t)'
  },
  'tabung': {
    id: 'tabung',
    label: 'Tabung',
    emoji: '🥫',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    rumusLP: '2πr(r + t)',
    rumusVol: 'π × r² × t',
    deskripsi: '2 lingkaran + selimut',
    tips: 'π = 22/7 atau 3,14. r = jari-jari'
  },
  'kerucut': {
    id: 'kerucut',
    label: 'Kerucut',
    emoji: '🎩',
    color: '#ef4444',
    bg: '#fef2f2',
    rumusLP: 'πr(r + s)',
    rumusVol: '⅓ × π × r² × t',
    deskripsi: '1 lingkaran + selimut lancip',
    tips: 's = garis pelukis. Volume = ⅓ tabung'
  },
  'bola': {
    id: 'bola',
    label: 'Bola',
    emoji: '⚽',
    color: '#ec4899',
    bg: '#fdf2f8',
    rumusLP: '4 × π × r²',
    rumusVol: '⁴/₃ × π × r³',
    deskripsi: 'Permukaan lengkung sempurna',
    tips: 'Hanya punya 1 sisi lengkung!'
  }
};

// ============================================
// GENERATOR SOAL
// ============================================
interface SoalRuang {
  bangun: BangunRuangConfig;
  tipe: 'luas-permukaan' | 'volume';
  dimensi: Record<string, number>;
  jawaban: number;
  jawabanBulat: number;
  langkah: string[];
  cerita: string;
  satuan: string;
  visualType: '3d' | 'jaring' | 'dimensi';
}

const generateSoalRuang = (): SoalRuang & { opts: number[] } => {
  const tipe = Math.random() > 0.5 ? 'luas-permukaan' : 'volume';
  const keys = Object.keys(BANGUN_RUANG) as BangunRuang[];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const bangun = BANGUN_RUANG[key];
  
  let dimensi: Record<string, number> = {};
  let jawaban = 0;
  let langkah: string[] = [];
  let satuan = '';

  const bulatkan = (n: number) => Math.round(n * 100) / 100;

  switch (bangun.id) {
    case 'kubus': {
      const s = Math.floor(Math.random() * 10) + 5;
      dimensi = { s };
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(6 * s * s);
        langkah = [
          'Rumus: LP = 6 × s × s',
          `LP = 6 × ${s} × ${s}`,
          `LP = 6 × ${s * s}`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = s * s * s;
        langkah = [
          'Rumus: V = s × s × s',
          `V = ${s} × ${s} × ${s}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
    case 'balok': {
      const p = Math.floor(Math.random() * 10) + 6;
      const l = Math.floor(Math.random() * 6) + 4;
      const t = Math.floor(Math.random() * 6) + 3;
      dimensi = { p, l, t };
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(2 * (p*l + p*t + l*t));
        langkah = [
          'Rumus: LP = 2(pl + pt + lt)',
          `LP = 2(${p}×${l} + ${p}×${t} + ${l}×${t})`,
          `LP = 2(${p*l} + ${p*t} + ${l*t})`,
          `LP = 2 × ${p*l + p*t + l*t}`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = p * l * t;
        langkah = [
          'Rumus: V = p × l × t',
          `V = ${p} × ${l} × ${t}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
    case 'prisma-segitiga': {
      const a = Math.floor(Math.random() * 8) + 4;
      const ta = Math.floor(Math.random() * 6) + 3;
      const tp = Math.floor(Math.random() * 10) + 8;
      const keliling = a + (Math.floor(Math.random() * 5) + 4) + (Math.floor(Math.random() * 5) + 4);
      const la = Math.round((a * ta) / 2);
      dimensi = { a, ta, tp };
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(2 * la + keliling * tp);
        langkah = [
          'Rumus: LP = 2×La + Keliling alas × t',
          `La = ½ × ${a} × ${ta} = ${la} cm²`,
          `LP = 2×${la} + ${keliling}×${tp}`,
          `LP = ${2*la} + ${keliling * tp}`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = la * tp;
        langkah = [
          'Rumus: V = Luas alas × tinggi',
          `La = ½ × ${a} × ${ta} = ${la} cm²`,
          `V = ${la} × ${tp}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
    case 'tabung': {
      const r = Math.floor(Math.random() * 7) + 3;
      const t = Math.floor(Math.random() * 12) + 8;
      dimensi = { r, t };
      const pi = r % 7 === 0 ? 22/7 : 3.14;
      const piStr = r % 7 === 0 ? '22/7' : '3,14';
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(2 * pi * r * (r + t));
        langkah = [
          `Rumus: LP = 2πr(r + t) [π=${piStr}]`,
          `LP = 2 × ${piStr} × ${r} × (${r} + ${t})`,
          `LP = 2 × ${piStr} × ${r} × ${r + t}`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = bulatkan(pi * r * r * t);
        langkah = [
          `Rumus: V = πr²t [π=${piStr}]`,
          `V = ${piStr} × ${r}² × ${t}`,
          `V = ${piStr} × ${r*r} × ${t}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
    case 'kerucut': {
      const r = Math.floor(Math.random() * 7) + 3;
      const t = Math.floor(Math.random() * 10) + 6;
      const s = Math.round(Math.sqrt(r*r + t*t));
      dimensi = { r, t, s };
      const pi = r % 7 === 0 ? 22/7 : 3.14;
      const piStr = r % 7 === 0 ? '22/7' : '3,14';
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(pi * r * (r + s));
        langkah = [
          `Rumus: LP = πr(r + s) [π=${piStr}]`,
          `s = √(${r}² + ${t}²) = ${s}`,
          `LP = ${piStr} × ${r} × (${r} + ${s})`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = bulatkan((1/3) * pi * r * r * t);
        langkah = [
          `Rumus: V = ⅓πr²t [π=${piStr}]`,
          `V = ⅓ × ${piStr} × ${r}² × ${t}`,
          `V = ⅓ × ${piStr} × ${r*r} × ${t}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
    case 'bola': {
      const r = Math.floor(Math.random() * 7) + 4;
      dimensi = { r };
      const pi = r % 7 === 0 ? 22/7 : 3.14;
      const piStr = r % 7 === 0 ? '22/7' : '3,14';
      if (tipe === 'luas-permukaan') {
        jawaban = bulatkan(4 * pi * r * r);
        langkah = [
          `Rumus: LP = 4πr² [π=${piStr}]`,
          `LP = 4 × ${piStr} × ${r}²`,
          `LP = 4 × ${piStr} × ${r*r}`,
          `LP = ${jawaban} cm²`
        ];
      } else {
        jawaban = bulatkan((4/3) * pi * r * r * r);
        langkah = [
          `Rumus: V = ⁴/₃πr³ [π=${piStr}]`,
          `V = ⁴/₃ × ${piStr} × ${r}³`,
          `V = ⁴/₃ × ${piStr} × ${r*r*r}`,
          `V = ${jawaban} cm³`
        ];
      }
      satuan = tipe === 'luas-permukaan' ? 'cm²' : 'cm³';
      break;
    }
  }

  const cerita = generateCeritaRuang(bangun.label, dimensi, tipe);

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.max(1, Math.round(jawaban * (0.15 + Math.random() * 0.3)));
    const w = Math.random() > 0.5 ? jawaban + offset : Math.max(1, jawaban - offset);
    if (w !== jawaban && !wrongs.has(w)) wrongs.add(Math.round(w));
  }

  return {
    bangun,
    tipe,
    dimensi,
    jawaban,
    jawabanBulat: Math.round(jawaban),
    langkah,
    cerita,
    satuan,
    visualType: tipe === 'luas-permukaan' ? 'jaring' : '3d',
    opts: [...wrongs, jawaban].sort(() => Math.random() - 0.5).map(n => Math.round(n))
  };
};

const generateCeritaRuang = (nama: string, dimensi: Record<string, number>, tipe: string): string => {
  const ceritaLP = [
    `Sebuah ${nama} akan dicat seluruh permukaannya. Berapa luas area yang harus dicat?`,
    `Ibu membuat kotak kado berbentuk ${nama}. Berapa kertas kado yang dibutuhkan?`,
    `Pabrik akan melapisi ${nama} dengan cat anti karat. Hitung luas permukaannya!`,
  ];
  const ceritaVol = [
    `Sebuah ${nama} akan diisi air. Berapa volume maksimal air yang bisa ditampung?`,
    `Berapa kapasitas maksimal ${nama} tersebut?`,
    `Hitung berapa banyak benda yang bisa masuk ke dalam ${nama}!`,
  ];
  const list = tipe === 'luas-permukaan' ? ceritaLP : ceritaVol;
  return list[Math.floor(Math.random() * list.length)];
};

// ============================================
// VISUAL SVG BANGUN RUANG
// ============================================
const VisualBangunRuang = ({ soal }: { soal: SoalRuang }) => {
  const { bangun, dimensi } = soal;
  const svgStyle = { width: '100%', maxWidth: '240px', height: '160px', margin: '0 auto' };

  switch (bangun.id) {
    case 'kubus': {
      const s = dimensi.s;
      const scale = Math.min(100 / s, 60);
      const w = s * scale;
      const h = s * scale;
      const depth = s * scale * 0.5;
      return (
        <svg viewBox="0 0 200 140" style={svgStyle}>
          {/* Front face */}
          <rect x={60} y={40} width={w} height={h} fill="#3b82f630" stroke="#3b82f6" strokeWidth="2" />
          {/* Top face */}
          <polygon points={`${60},${40} ${60+depth},${40-depth*0.7} ${60+depth+w},${40-depth*0.7} ${60+w},${40}`} fill="#3b82f650" stroke="#3b82f6" strokeWidth="2" />
          {/* Right face */}
          <polygon points={`${60+w},${40} ${60+depth+w},${40-depth*0.7} ${60+depth+w},${40-depth*0.7+h} ${60+w},${40+h}`} fill="#3b82f620" stroke="#3b82f6" strokeWidth="2" />
          <text x={60 + w/2} y={45 + h + 20} textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="700">{s} cm</text>
          <text x={48} y={40 + h/2} textAnchor="end" fontSize="11" fill="#1e40af" fontWeight="700">{s} cm</text>
        </svg>
      );
    }
    case 'balok': {
      const { p, l, t } = dimensi;
      const sx = Math.min(100 / p, 40);
      const sy = Math.min(60 / t, 30);
      const w = p * sx;
      const h = t * sy;
      const depth = l * sx * 0.4;
      return (
        <svg viewBox="0 0 220 140" style={svgStyle}>
          <rect x={60} y={40} width={w} height={h} fill="#10b98130" stroke="#10b981" strokeWidth="2" />
          <polygon points={`${60},${40} ${60+depth},${40-depth*0.6} ${60+depth+w},${40-depth*0.6} ${60+w},${40}`} fill="#10b98150" stroke="#10b981" strokeWidth="2" />
          <polygon points={`${60+w},${40} ${60+depth+w},${40-depth*0.6} ${60+depth+w},${40-depth*0.6+h} ${60+w},${40+h}`} fill="#10b98120" stroke="#10b981" strokeWidth="2" />
          <text x={60 + w/2} y={45 + h + 18} textAnchor="middle" fontSize="10" fill="#065f46" fontWeight="700">p={p}</text>
          <text x={48} y={40 + h/2} textAnchor="end" fontSize="10" fill="#065f46" fontWeight="700">t={t}</text>
          <text x={65 + w/2} y={38 - depth*0.6} textAnchor="middle" fontSize="9" fill="#065f46" fontWeight="700">l={l}</text>
        </svg>
      );
    }
    case 'tabung': {
      const { r, t } = dimensi;
      const scale = Math.min(80 / (r*2), 50 / t);
      const w = r * 2 * scale;
      const h = t * scale;
      return (
        <svg viewBox="0 0 200 140" style={svgStyle}>
          <ellipse cx={100} cy={80} rx={w/2} ry={w*0.2} fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="2" />
          <rect x={100-w/2} y={40} width={w} height={h} fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="2" />
          <ellipse cx={100} cy={40} rx={w/2} ry={w*0.2} fill="#8b5cf640" stroke="#8b5cf6" strokeWidth="2" />
          <line x1={100} y1={40} x2={100+w/2} y2={40+w*0.1} stroke="#5b21b6" strokeWidth="1" />
          <text x={100+w/2+10} y={42} fontSize="10" fill="#5b21b6" fontWeight="700">r={r}</text>
          <text x={100+w/2+14} y={65} fontSize="10" fill="#5b21b6" fontWeight="700">t={t}</text>
        </svg>
      );
    }
    default: {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '50px', background: bangun.bg, borderRadius: '12px' }}>
          {bangun.emoji}
          <p style={{ fontSize: '11px', color: bangun.color, marginTop: '4px', fontWeight: '600' }}>
            {Object.entries(dimensi).map(([k, v]) => `${k}=${v}cm`).join(', ')}
          </p>
        </div>
      );
    }
  }
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function RuangMaster({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [soal, setSoal] = useState<any>(null);
  const [soalIndex, setSoalIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionStep, setSolutionStep] = useState(0);
  const TOTAL = 10;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (step === 'play') {
      setSoal(generateSoalRuang());
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
    const ok = Math.abs(ans - soal.jawaban) < 0.5;
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
    if (soalIndex < TOTAL - 1) setSoalIndex(i => i + 1);
    else setStep('complete');
  };

  const revealStep = () => {
    if (soal && solutionStep < soal.langkah.length - 1) {
      setSolutionStep(s => s + 1);
    }
  };

  const start = () => { setStep('play'); setScore(0); setSoalIndex(0); setStreak(0); };
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🏠</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Bangun Ruang!' : stars === 2 ? 'Hampir Jago!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0', fontSize: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#3b82f6', margin: 0 }}>Skor: {score}/{TOTAL}</p>
          <p style={{ color: theme.textSecondary, margin: '4px 0 0', fontSize: '12px' }}>Luas Permukaan & Volume Bangun Ruang</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total: TOTAL })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>🏠</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>RuangMaster!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '4px', fontSize: '14px' }}>Luas Permukaan & Volume Bangun Ruang</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.values(BANGUN_RUANG).map(b => (
            <div key={b.id} style={{ background: b.bg, borderRadius: '12px', padding: '10px 4px', textAlign: 'center', border: `2px solid ${b.color}40` }}>
              <div style={{ fontSize: '30px' }}>{b.emoji}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: b.color }}>{b.label}</div>
              <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>{b.tips}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#1e40af', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🎯 Target:</strong> Jawab 10 soal luas permukaan & volume<br/>
          <strong>💡 Tips:</strong> Perhatikan satuan! Luas = cm², Volume = cm³<br/>
          <strong>🔍 Bantuan:</strong> Kalau salah, bisa lihat langkah demi langkah!
        </div>
        <button onClick={start}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
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
        <div style={{ background: soal.bangun.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          <span style={{ fontSize: '18px' }}>{soal.bangun.emoji}</span>
          <span style={{ fontWeight: '700', color: soal.bangun.color }}>
            {soal.bangun.label} • {soal.tipe === 'luas-permukaan' ? 'Luas Permukaan' : 'Volume'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{soalIndex + 1}/{TOTAL}</span>
          <span style={{ color: '#3b82f6' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Rumus Quick Ref */}
      <div style={{
        background: '#f0fdf4', borderRadius: '8px', padding: '5px 10px', marginBottom: '8px',
        fontSize: '10px', fontWeight: '600', color: '#065f46', display: 'inline-block'
      }}>
        {soal.tipe === 'luas-permukaan' ? `📐 LP = ${soal.bangun.rumusLP}` : `📦 V = ${soal.bangun.rumusVol}`}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {/* Cerita */}
        <div style={{
          background: '#fffbeb', borderRadius: '12px', padding: '12px', border: '1px solid #fbbf2420',
          display: 'flex', alignItems: 'center', textAlign: 'left'
        }}>
          <div>
            <p style={{ fontSize: '9px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>📖 SOAL CERITA</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', lineHeight: '1.5', margin: 0 }}>{soal.cerita}</p>
          </div>
        </div>
        {/* Visual */}
        <div style={{
          background: '#f9fafb', borderRadius: '12px', padding: '8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${soal.bangun.color}20`
        }}>
          <VisualBangunRuang soal={soal} />
          <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
            {Object.entries(soal.dimensi).map(([k, v]) => `${k}=${v}cm`).join(', ')}
          </p>
        </div>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {soal.opts.map((opt: number, i: number) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === Math.round(soal.jawaban);
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

      {/* Solution Steps */}
      {showSolution && soal && (
        <div style={{ marginTop: '12px', background: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'left', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>💡 LANGKAH PENYELESAIAN:</p>
          {soal.langkah.slice(0, solutionStep + 1).map((step: string, i: number) => (
            <p key={i} style={{
              fontSize: '12px', color: '#92400e', margin: '3px 0', padding: '4px 8px',
              background: i === solutionStep ? '#fbbf2420' : 'transparent', borderRadius: '4px',
              fontWeight: i === solutionStep ? '700' : '400', borderLeft: i === solutionStep ? '3px solid #f59e0b' : '3px solid transparent'
            }}>{i + 1}. {step}</p>
          ))}
          {solutionStep < soal.langkah.length - 1 && (
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
            {isCorrect ? `🎉 Benar! ${Math.round(soal.jawaban)} ${soal.satuan}` : `❌ Jawaban: ${Math.round(soal.jawaban)} ${soal.satuan}`}
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