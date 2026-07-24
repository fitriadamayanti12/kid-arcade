// app/components/AIGameGenerator.tsx
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface AIGameGeneratorProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// TYPE DEFINITIONS
// ============================================
type GradeLevel = 'paud' | 'tk' | '1' | '2' | '3' | '4' | '5' | '6';
type QuestionType = 'input' | 'choice';
type DisplayType = 'emoji-grid' | 'number-big' | 'fraction-visual' | 'multiplication-grid' | 'shape' | 'math' | 'shape-info' | 'division-visual' | 'clock' | 'money' | 'fraction-op' | 'kpk-fpb' | '3d-shape' | 'story' | 'emoji-puzzle' | 'fact' | 'pattern' | 'text';

interface GameCategory {
  id: string;
  title: string;
  icon: string;
  desc: string;
  grades: GradeLevel[];
  color: string;
  bg: string;
}

interface DisplayData {
  type: DisplayType;
  [key: string]: any;
}

interface GameQuestion {
  question: string;
  display: DisplayData;
  answer: string | number;
  options?: (string | number)[];
  type: QuestionType;
  hint?: string;
  explanation?: string;
}

// ============================================
// GAME CATEGORIES
// ============================================
const GAME_CATEGORIES: GameCategory[] = [
  { id: 'kenal-angka', title: '🌟 Kenal Angka', icon: '🔢', desc: 'Mengenal angka 1-10', grades: ['paud'], color: '#f59e0b', bg: '#fffbeb' },
  { id: 'hitung-benda', title: '🧸 Hitung Benda', icon: '🎯', desc: 'Menghitung benda sederhana', grades: ['paud', 'tk'], color: '#10b981', bg: '#ecfdf5' },
  { id: 'warna-bentuk', title: '🎨 Warna & Bentuk', icon: '🔺', desc: 'Mengenal warna dan bentuk', grades: ['paud', 'tk'], color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'tambah-sederhana', title: '➕ Tambah Asyik', icon: '🧮', desc: 'Penjumlahan 1-10', grades: ['tk', '1'], color: '#3b82f6', bg: '#eff6ff' },
  { id: 'kurang-sederhana', title: '➖ Kurang Seru', icon: '🎲', desc: 'Pengurangan 1-10', grades: ['tk', '1'], color: '#ef4444', bg: '#fef2f2' },
  { id: 'pola-sederhana', title: '🧩 Pola Gambar', icon: '🔮', desc: 'Melengkapi pola', grades: ['tk', '1'], color: '#ec4899', bg: '#fdf2f8' },
  { id: 'tambah-cepat', title: '⚡ Tambah Cepat', icon: '➕', desc: 'Penjumlahan 1-50', grades: ['1', '2'], color: '#06b6d4', bg: '#ecfeff' },
  { id: 'kurang-cepat', title: '💨 Kurang Cepat', icon: '➖', desc: 'Pengurangan 1-50', grades: ['1', '2'], color: '#f97316', bg: '#fff7ed' },
  { id: 'kali-dasar', title: '✖️ Kali Dasar', icon: '📊', desc: 'Perkalian 1-5', grades: ['2', '3'], color: '#84cc16', bg: '#f7fee7' },
  { id: 'bagi-dasar', title: '➗ Bagi Dasar', icon: '🧁', desc: 'Pembagian sederhana', grades: ['2', '3'], color: '#14b8a6', bg: '#f0fdfa' },
  { id: 'pecahan-seru', title: '🍕 Pecahan Seru', icon: '🍕', desc: 'Pecahan visual', grades: ['3', '4'], color: '#e11d48', bg: '#fff1f2' },
  { id: 'geometri-fun', title: '📐 Geometri Fun', icon: '📏', desc: 'Bangun datar & sifatnya', grades: ['3', '4'], color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'waktu-kalender', title: '🕐 Waktu & Kalender', icon: '📅', desc: 'Membaca jam & tanggal', grades: ['3', '4'], color: '#2563eb', bg: '#eff6ff' },
  { id: 'uang-belajar', title: '💵 Uang & Belanja', icon: '🛒', desc: 'Menghitung uang', grades: ['3', '4'], color: '#059669', bg: '#ecfdf5' },
  { id: 'pecahan-lanjut', title: '🧮 Pecahan Lanjut', icon: '📝', desc: 'Operasi pecahan', grades: ['5', '6'], color: '#dc2626', bg: '#fef2f2' },
  { id: 'desimal-persen', title: '💯 Desimal & Persen', icon: '📈', desc: 'Konversi & operasi', grades: ['5', '6'], color: '#ca8a04', bg: '#fefce8' },
  { id: 'kpk-fpb', title: '🔑 KPK & FPB', icon: '🗝️', desc: 'Kelipatan & faktor', grades: ['5', '6'], color: '#9333ea', bg: '#faf5ff' },
  { id: 'bangun-ruang', title: '📦 Bangun Ruang', icon: '🏗️', desc: 'Volume & luas permukaan', grades: ['5', '6'], color: '#0891b2', bg: '#ecfeff' },
  { id: 'logika-matematika', title: '🧠 Logika Math', icon: '💡', desc: 'Soal cerita & logika', grades: ['5', '6'], color: '#4f46e5', bg: '#eef2ff' },
  { id: 'tebak-emoji', title: '😎 Tebak Emoji', icon: '🤔', desc: 'Tebak kata dari emoji', grades: ['paud', 'tk', '1', '2', '3', '4', '5', '6'], color: '#db2777', bg: '#fdf2f8' },
  { id: 'fakta-unik', title: '🌍 Fakta Unik', icon: '📚', desc: 'Pengetahuan umum', grades: ['3', '4', '5', '6'], color: '#0d9488', bg: '#f0fdfa' },
  { id: 'cepat-tepat', title: '⏱️ Cepat Tepat', icon: '🎯', desc: 'Drill soal campuran', grades: ['1', '2', '3', '4', '5', '6'], color: '#ea580c', bg: '#fff7ed' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateMathOptions = (correct: number, maxRange: number): number[] => {
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * Math.max(5, Math.floor(maxRange * 0.3))) + 1;
    const w = Math.random() > 0.5 ? correct + offset : Math.max(0, correct - offset);
    if (w !== correct && w >= 0) opts.add(w);
  }
  return Array.from(opts).sort(() => Math.random() - 0.5);
};

const findGCD = (a: number, b: number): number => {
  let x = a, y = b;
  while (y) { [x, y] = [y, x % y]; }
  return x;
};

const getFactors = (n: number): number[] => {
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
};

// ============================================
// QUESTION GENERATOR
// ============================================
const generateQuestion = (gameId: string): GameQuestion => {
  switch (gameId) {
    // PAUD
    case 'kenal-angka': {
      const num = Math.floor(Math.random() * 10) + 1;
      const emojis = ['⭐', '🌟', '💛', '🎈', '🌸', '🍎', '🐱', '🐶', '🦋', '🌈'];
      return {
        question: 'Angka berapa ini?',
        display: { type: 'number-big' as const, value: num },
        answer: num,
        options: [num, num + 1, num - 1 || 10, num + 2].sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `Ini adalah angka ${num}! ${emojis[num - 1].repeat(Math.min(num, 5))}`
      };
    }

    case 'hitung-benda': {
      const count = Math.floor(Math.random() * 8) + 2;
      const emojis = ['🍎', '🐱', '🌟', '🎈', '🌸', '🐶', '🦋', '💛'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      return {
        question: `Berapa jumlah ${emoji}?`,
        display: { type: 'emoji-grid' as const, emoji, count },
        answer: count,
        options: [count, count + 1, Math.max(1, count - 1), count + 2]
          .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
          .sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `Ada ${count} ${emoji}. Hitung: ${Array(count).fill(emoji).join(' ')}`
      };
    }

    case 'warna-bentuk': {
      const shapes: { name: string; emoji: string; color: string }[] = [
        { name: 'Lingkaran', emoji: '⭕', color: '#ef4444' },
        { name: 'Segitiga', emoji: '🔺', color: '#3b82f6' },
        { name: 'Persegi', emoji: '🟨', color: '#f59e0b' },
        { name: 'Bintang', emoji: '⭐', color: '#8b5cf6' },
        { name: 'Hati', emoji: '❤️', color: '#ec4899' },
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: 'Bentuk apa ini?',
        display: { type: 'shape' as const, emoji: shape.emoji, color: shape.color },
        answer: shape.name,
        options: shapes.map(s => s.name).sort(() => Math.random() - 0.5).slice(0, 4),
        type: 'choice' as const,
        explanation: `Ini adalah ${shape.name} ${shape.emoji}!`
      };
    }

    // TK - Kelas 1
    case 'tambah-sederhana': {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return {
        question: `${a} + ${b} = ?`,
        display: { type: 'math' as const, expression: `${a} + ${b}` },
        answer: a + b,
        options: generateMathOptions(a + b, 20),
        type: 'choice' as const,
        hint: `Hitung dengan jari: ${a} + ${b}`,
        explanation: `${a} + ${b} = ${a + b}`
      };
    }

    case 'kurang-sederhana': {
      const a = Math.floor(Math.random() * 10) + 5;
      const b = Math.floor(Math.random() * a);
      return {
        question: `${a} - ${b} = ?`,
        display: { type: 'math' as const, expression: `${a} - ${b}` },
        answer: a - b,
        options: generateMathOptions(a - b, 15),
        type: 'choice' as const,
        hint: `Dari ${a}, ambil ${b}. Sisa berapa?`,
        explanation: `${a} - ${b} = ${a - b}`
      };
    }

    case 'pola-sederhana': {
      const patterns: { sequence: string; answer: string; rule: string }[] = [
        { sequence: '🔴🔵🔴🔵?', answer: '🔴', rule: 'Merah-Biru bergantian' },
        { sequence: '⭐🌟⭐🌟?', answer: '⭐', rule: 'Bintang berselang' },
        { sequence: '🍎🍎🍊🍎🍎?', answer: '🍊', rule: '2 apel, 1 jeruk' },
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      const allOpts = ['🔴', '🔵', '⭐', '🌟', '🍎', '🍊'];
      const wrongs = allOpts.filter(o => o !== p.answer).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        question: `Lengkapi pola:\n${p.sequence}`,
        display: { type: 'pattern' as const, sequence: p.sequence },
        answer: p.answer,
        options: [...wrongs, p.answer].sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `Polanya: ${p.rule}`
      };
    }

    // Kelas 1-2
    case 'tambah-cepat': {
      const a = Math.floor(Math.random() * 30) + 10;
      const b = Math.floor(Math.random() * 20) + 5;
      return {
        question: `${a} + ${b} = ?`,
        display: { type: 'math' as const, expression: `${a} + ${b}` },
        answer: a + b,
        type: 'input' as const,
        hint: `${a} + ${b} = ${Math.floor(a/10)*10} + ${a%10} + ${b}`,
        explanation: `${a} + ${b} = ${a + b}`
      };
    }

    case 'kurang-cepat': {
      const a = Math.floor(Math.random() * 40) + 15;
      const b = Math.floor(Math.random() * a);
      return {
        question: `${a} - ${b} = ?`,
        display: { type: 'math' as const, expression: `${a} - ${b}` },
        answer: a - b,
        type: 'input' as const,
        explanation: `${a} - ${b} = ${a - b}`
      };
    }

    case 'kali-dasar': {
      const a = Math.floor(Math.random() * 4) + 2;
      const b = Math.floor(Math.random() * 5) + 1;
      const answer = a * b;
      return {
        question: `${a} × ${b} = ?`,
        display: { type: 'multiplication-grid' as const, a, b },
        answer,
        options: generateMathOptions(answer, a * 6),
        type: 'choice' as const,
        hint: `${a} + ${a} + ${a}... (${b} kali)`,
        explanation: `${a} × ${b} = ${answer}. ${Array(b).fill(a).join('+')} = ${answer}`
      };
    }

    case 'bagi-dasar': {
      const b = Math.floor(Math.random() * 4) + 2;
      const answer = Math.floor(Math.random() * 5) + 2;
      const a = b * answer;
      return {
        question: `${a} ÷ ${b} = ?`,
        display: { type: 'division-visual' as const, total: a, groups: b },
        answer,
        options: generateMathOptions(answer, a),
        type: 'choice' as const,
        hint: `${a} dibagi ${b} sama rata`,
        explanation: `${a} ÷ ${b} = ${answer}. ${b} × ${answer} = ${a}`
      };
    }

    // Kelas 3-4
    case 'pecahan-seru': {
      const numerator = Math.floor(Math.random() * 3) + 1;
      const denominators = [2, 3, 4, 6, 8];
      const denominator = denominators[Math.floor(Math.random() * denominators.length)];
      return {
        question: 'Bagian yang diarsir menunjukkan pecahan?',
        display: { type: 'fraction-visual' as const, numerator, denominator },
        answer: `${numerator}/${denominator}`,
        options: [
          `${numerator}/${denominator}`,
          `${denominator}/${numerator}`,
          `${numerator}/${numerator + 1}`,
          `${denominator - numerator}/${denominator}`
        ].sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `${numerator} dari ${denominator} bagian = ${numerator}/${denominator}`
      };
    }

    case 'geometri-fun': {
      const shapes: { name: string; sides: number; properties: string; emoji: string }[] = [
        { name: 'Persegi', sides: 4, properties: '4 sisi sama, 4 sudut siku-siku', emoji: '🟨' },
        { name: 'Persegi Panjang', sides: 4, properties: '2 pasang sisi sama panjang', emoji: '🟩' },
        { name: 'Segitiga', sides: 3, properties: '3 sisi, jumlah sudut 180°', emoji: '🔺' },
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `${shape.emoji} Bangun apa? Berapa sisinya?`,
        display: { type: 'shape-info' as const, emoji: shape.emoji, name: shape.name },
        answer: shape.sides,
        options: [shape.sides, shape.sides + 1, Math.max(0, shape.sides - 1), 5]
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `${shape.name}: ${shape.properties}. Sisi = ${shape.sides}`
      };
    }

    case 'waktu-kalender': {
      const qs: { q: string; a: string | number; exp: string }[] = [
        { q: '1 jam = ... menit', a: 60, exp: '1 jam = 60 menit' },
        { q: '1 hari = ... jam', a: 24, exp: '1 hari = 24 jam' },
        { q: 'Bulan ke-8 adalah?', a: 'Agustus', exp: 'Agustus = bulan ke-8' },
      ];
      const q = qs[Math.floor(Math.random() * qs.length)];
      return {
        question: q.q,
        display: { type: 'clock' as const },
        answer: q.a,
        type: typeof q.a === 'number' ? 'input' as const : 'choice' as const,
        options: typeof q.a === 'string' ? ['Agustus', 'September', 'Oktober', 'Juli'] : undefined,
        explanation: q.exp
      };
    }

    case 'uang-belajar': {
      const item = { name: 'Buku', price: 5000 };
      const qty = Math.floor(Math.random() * 3) + 2;
      return {
        question: `${qty} ${item.name} @ Rp${item.price.toLocaleString()} = ?`,
        display: { type: 'money' as const, item: item.name, price: item.price, qty },
        answer: item.price * qty,
        type: 'input' as const,
        hint: `${qty} × Rp${item.price.toLocaleString()}`,
        explanation: `${qty} × Rp${item.price.toLocaleString()} = Rp${(item.price * qty).toLocaleString()}`
      };
    }

    // Kelas 5-6
    case 'pecahan-lanjut': {
      const denom = Math.floor(Math.random() * 5) + 3;
      const num1 = Math.floor(Math.random() * 3) + 1;
      const num2 = Math.floor(Math.random() * 3) + 1;
      const numResult = num1 + num2;
      return {
        question: `${num1}/${denom} + ${num2}/${denom} = ?`,
        display: { type: 'fraction-op' as const, expr: `${num1}/${denom} + ${num2}/${denom}` },
        answer: `${numResult}/${denom}`,
        options: [`${numResult}/${denom}`, `${num1 + num2}/${denom + denom}`, `${num1 + num2}/${denom * 2}`, `${numResult + 1}/${denom}`],
        type: 'choice' as const,
        hint: `Penyebut sudah sama: ${denom}`,
        explanation: `${num1}/${denom} + ${num2}/${denom} = ${num1 + num2}/${denom} = ${numResult}/${denom}`
      };
    }

    case 'desimal-persen': {
      const qs: { q: string; a: number; exp: string }[] = [
        { q: '0,25 = ... %', a: 25, exp: '0,25 × 100% = 25%' },
        { q: '50% dari 200 = ?', a: 100, exp: '50% = 1/2. 1/2 × 200 = 100' },
      ];
      const q = qs[Math.floor(Math.random() * qs.length)];
      return {
        question: q.q,
        display: { type: 'math' as const, expression: q.q },
        answer: q.a,
        type: 'input' as const,
        explanation: q.exp
      };
    }

    case 'kpk-fpb': {
      const nums = [
        [8, 12], [6, 9], [10, 15], [12, 18], [9, 12]
      ];
      const [a, b] = nums[Math.floor(Math.random() * nums.length)];
      const isKPK = Math.random() > 0.5;
      const gcd = findGCD(a, b);
      const lcm = (a * b) / gcd;
      return {
        question: isKPK ? `KPK dari ${a} dan ${b} = ?` : `FPB dari ${a} dan ${b} = ?`,
        display: { type: 'kpk-fpb' as const, a, b, mode: isKPK ? 'KPK' : 'FPB' },
        answer: isKPK ? lcm : gcd,
        type: 'input' as const,
        hint: isKPK ? `Kelipatan ${a}: ${a}, ${a*2}, ${a*3}...` : `Faktor ${a}: ${getFactors(a).join(',')}`,
        explanation: isKPK ? `KPK(${a},${b}) = ${lcm}` : `FPB(${a},${b}) = ${gcd}`
      };
    }

    case 'bangun-ruang': {
      const shapes: { name: string; sisi: number; rusuk: number; emoji: string }[] = [
        { name: 'Kubus', sisi: 6, rusuk: 12, emoji: '🧊' },
        { name: 'Balok', sisi: 6, rusuk: 12, emoji: '📦' },
        { name: 'Tabung', sisi: 3, rusuk: 2, emoji: '🥫' },
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `${shape.emoji} Bangun ruang apa? Jumlah sisi = ?`,
        display: { type: '3d-shape' as const, emoji: shape.emoji },
        answer: shape.sisi,
        options: [shape.sisi, shape.sisi + 1, Math.max(0, shape.sisi - 1), 8]
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort(() => Math.random() - 0.5),
        type: 'choice' as const,
        explanation: `${shape.name}: ${shape.sisi} sisi, ${shape.rusuk} rusuk`
      };
    }

    case 'logika-matematika': {
      const stories: { q: string; a: number; exp: string }[] = [
        { q: 'Bus: 40 orang. Turun 12, naik 8. Sisa?', a: 36, exp: '40 - 12 + 8 = 36' },
        { q: '3 lusin telur. 1 lusin = 12. Total?', a: 36, exp: '3 × 12 = 36 butir' },
      ];
      const s = stories[Math.floor(Math.random() * stories.length)];
      return {
        question: s.q,
        display: { type: 'story' as const, text: s.q },
        answer: s.a,
        type: 'input' as const,
        explanation: s.exp
      };
    }

    // Umum
    case 'tebak-emoji': {
      const puzzles: { emojis: string; answer: string; hint: string }[] = [
        { emojis: '🍎➕🍊', answer: 'Buah', hint: '2 jenis buah' },
        { emojis: '🐱➕🐶', answer: 'Hewan', hint: '2 hewan peliharaan' },
        { emojis: '📚➕✏️', answer: 'Sekolah', hint: 'Tempat belajar' },
      ];
      const p = puzzles[Math.floor(Math.random() * puzzles.length)];
      return {
        question: `Tebak: ${p.emojis}`,
        display: { type: 'emoji-puzzle' as const, emojis: p.emojis },
        answer: p.answer.toLowerCase(),
        type: 'input' as const,
        hint: p.hint,
        explanation: `${p.emojis} = ${p.answer}!`
      };
    }

    case 'fakta-unik': {
      const facts: { q: string; a: string | number; exp: string; opts?: string[] }[] = [
        { q: 'Jumlah planet di tata surya?', a: 8, exp: '8 planet: Merkurius sampai Neptunus' },
        { q: 'Hewan terbesar di dunia?', a: 'Paus Biru', exp: 'Paus Biru = 30 meter!', opts: ['Paus Biru', 'Gajah', 'Jerapah', 'Hiu Paus'] },
      ];
      const f = facts[Math.floor(Math.random() * facts.length)];
      return {
        question: f.q,
        display: { type: 'fact' as const },
        answer: f.a,
        type: f.opts ? 'choice' as const : 'input' as const,
        options: f.opts,
        explanation: f.exp
      };
    }

    case 'cepat-tepat': {
      const subGames = ['tambah-cepat', 'kurang-cepat', 'kali-dasar', 'bagi-dasar'];
      const subGame = subGames[Math.floor(Math.random() * subGames.length)];
      return generateQuestion(subGame);
    }

    default:
      return {
        question: 'Soal tidak tersedia',
        display: { type: 'text' as const },
        answer: '',
        type: 'input' as const
      };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function AIGameGenerator({ playerName, onComplete }: AIGameGeneratorProps) {
  const theme = useThemeStyles();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedGame, setSelectedGame] = useState<GameCategory | null>(null);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const TOTAL_QUESTIONS = 10;

  const filteredGames = selectedGrade === 'all' 
    ? GAME_CATEGORIES 
    : GAME_CATEGORIES.filter(g => g.grades.includes(selectedGrade as GradeLevel));

  const selectGame = (game: GameCategory) => {
    setSelectedGame(game);
    setScore(0);
    setQuestionNum(0);
    setStreak(0);
    setIsCorrect(null);
    setShowHint(false);
    const q = generateQuestion(game.id);
    setQuestion(q);
    setUserInput('');
    setSelectedOption(null);
  };

  const handleAnswer = (answer?: string | number) => {
    const finalAnswer = answer !== undefined ? answer : userInput;
    if (finalAnswer === '' || !question || isCorrect !== null) return;
    
    let correct = false;
    if (question.type === 'choice') {
      correct = String(finalAnswer).toLowerCase() === String(question.answer).toLowerCase();
    } else {
      correct = Number(finalAnswer) === Number(question.answer) || 
                String(finalAnswer).toLowerCase() === String(question.answer).toLowerCase();
    }
    
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    
    setSelectedOption(answer !== undefined ? answer : null);
  };

  const nextQuestion = () => {
    const finalScore = isCorrect ? score + 1 : score;
    if (questionNum >= TOTAL_QUESTIONS - 1) {
      const stars = finalScore >= 9 ? 3 : finalScore >= 7 ? 2 : finalScore >= 4 ? 1 : 0;
      onComplete(stars, { 
        score: finalScore, 
        total: TOTAL_QUESTIONS, 
        game: selectedGame?.title,
        streak 
      });
      return;
    }
    
    setQuestionNum(n => n + 1);
    if (selectedGame) {
      setQuestion(generateQuestion(selectedGame.id));
    }
    setUserInput('');
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isCorrect === null) handleAnswer();
    if (e.key === 'Enter' && isCorrect !== null) nextQuestion();
  };

  // ============ GAME SELECT MENU ============
  if (!selectedGame) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '4px' }}>🤖</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.heading, margin: '0 0 2px' }}>AI Game Generator</h2>
        <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '10px' }}>
          Halo {playerName || 'Player'}! 👋 Pilih game seru!
        </p>
        
        {/* Grade Filter */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['all', 'paud', 'tk', '1', '2', '3', '4', '5', '6'] as const).map(grade => (
            <button key={grade} onClick={() => setSelectedGrade(grade)}
              style={{
                padding: '4px 10px', borderRadius: '12px', 
                border: selectedGrade === grade ? `2px solid #7c3aed` : `1px solid ${theme.border}`,
                background: selectedGrade === grade ? '#ede9fe' : 'transparent',
                color: theme.text, fontSize: '11px', fontWeight: selectedGrade === grade ? '700' : '500',
                cursor: 'pointer'
              }}>
              {grade === 'all' ? '🎯 Semua' : grade === 'paud' ? '👶 PAUD' : grade === 'tk' ? '🧒 TK' : `Kls ${grade}`}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <div style={{ display: 'grid', gap: '6px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredGames.map(game => (
            <button key={game.id} onClick={() => selectGame(game)} style={{
              padding: '10px 14px', borderRadius: '12px', border: `1px solid ${theme.border}`,
              background: theme.bgCard, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '24px' }}>{game.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: theme.heading }}>{game.title}</div>
                <div style={{ fontSize: '11px', color: theme.textSecondary }}>{game.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ fontSize: '10px', color: theme.textMuted, marginTop: '8px' }}>
          🎮 {filteredGames.length} game
        </p>
      </div>
    );
  }

  // ============ PLAYING ============
  if (!question) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setSelectedGame(null)} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontSize: '18px', cursor: 'pointer', padding: '2px' }}>
            ←
          </button>
          <span style={{ fontSize: '18px' }}>{selectedGame.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: theme.heading }}>{selectedGame.title}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{questionNum + 1}/{TOTAL_QUESTIONS}</span>
          <span style={{ color: '#10b981' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#f59e0b' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '5px', background: theme.border, borderRadius: '3px', marginBottom: '12px' }}>
        <div style={{ 
          width: `${(questionNum / TOTAL_QUESTIONS) * 100}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', 
          borderRadius: '3px', 
          transition: 'width 0.3s' 
        }} />
      </div>

      {/* Question Card */}
      <div style={{ 
        background: theme.bgCard, 
        borderRadius: '16px', 
        padding: '20px', 
        marginBottom: '12px', 
        border: `1px solid ${theme.border}`, 
        boxShadow: theme.shadow 
      }}>
        {/* Visual Display */}
        {question.display.type === 'emoji-grid' && (
          <div style={{ fontSize: '36px', letterSpacing: '6px', marginBottom: '8px' }}>
            {Array(question.display.count as number).fill(question.display.emoji as string).join(' ')}
          </div>
        )}
        {question.display.type === 'number-big' && (
          <div style={{ fontSize: '64px', fontWeight: '900', color: '#7c3aed', marginBottom: '4px' }}>
            {question.display.value as number}
          </div>
        )}
        {question.display.type === 'fraction-visual' && (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
            {Array(question.display.denominator as number).fill(0).map((_, i) => (
              <div key={i} style={{
                width: '40px', height: '40px', borderRadius: '6px',
                background: i < (question.display.numerator as number) ? '#7c3aed' : '#e5e7eb',
                border: '2px solid #d1d5db'
              }} />
            ))}
          </div>
        )}
        {question.display.type === 'multiplication-grid' && (
          <div style={{ marginBottom: '8px' }}>
            {Array(question.display.b as number).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '2px' }}>
                {Array(question.display.a as number).fill(0).map((_, j) => (
                  <span key={j} style={{ fontSize: '20px' }}>⭐</span>
                ))}
              </div>
            ))}
          </div>
        )}
        {question.display.type === 'shape' && (
          <div style={{ fontSize: '60px', marginBottom: '4px' }}>{question.display.emoji as string}</div>
        )}
        {question.display.type === 'math' && (
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#1f2937', marginBottom: '4px' }}>
            {question.display.expression as string}
          </div>
        )}
        
        {/* Question Text */}
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: theme.heading, 
          lineHeight: '1.5', 
          whiteSpace: 'pre-line', 
          margin: 0 
        }}>
          {question.question}
        </h3>
        
        {/* Hint */}
        {question.hint && isCorrect === null && (
          <div>
            <button onClick={() => setShowHint(!showHint)}
              style={{ 
                marginTop: '8px', 
                fontSize: '11px', 
                border: 'none', 
                background: 'none', 
                color: '#f59e0b', 
                cursor: 'pointer', 
                fontWeight: '600', 
                textDecoration: 'underline' 
              }}>
              {showHint ? '🕵️ Sembunyikan' : '💡 Butuh petunjuk?'}
            </button>
            {showHint && (
              <div style={{ 
                marginTop: '6px', 
                padding: '6px 10px', 
                background: '#fef3c7', 
                borderRadius: '6px', 
                fontSize: '12px', 
                color: '#92400e', 
                fontWeight: '600' 
              }}>
                {question.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Area */}
      {isCorrect === null && (
        <>
          {question.type === 'input' && (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <input
                type={typeof question.answer === 'number' ? 'number' : 'text'}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jawaban..."
                autoFocus
                style={{
                  padding: '10px 14px', fontSize: '18px', textAlign: 'center',
                  borderRadius: '10px', border: `2px solid ${theme.border}`,
                  background: '#fff', color: '#1f2937',
                  width: '120px', outline: 'none'
                }}
              />
              <button onClick={() => handleAnswer()}
                style={{ 
                  padding: '10px 18px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: '#7c3aed', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}>
                ✅
              </button>
            </div>
          )}
          
          {question.type === 'choice' && question.options && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '280px', margin: '0 auto' }}>
              {question.options.map((opt: string | number, i: number) => (
                <button key={i} onClick={() => handleAnswer(opt)}
                  style={{
                    padding: '12px', borderRadius: '10px', border: 'none',
                    background: '#f3f4f6', color: '#1f2937',
                    fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}>
                  {String(opt)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Feedback */}
      {isCorrect !== null && (
        <div style={{ animation: 'pop 0.3s ease-out' }}>
          <div style={{
            padding: '12px', borderRadius: '10px', marginBottom: '8px',
            background: isCorrect ? '#d1fae5' : '#fee2e2',
            color: isCorrect ? '#065f46' : '#991b1b',
            fontWeight: '700', fontSize: '15px'
          }}>
            {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${question.answer}`}
          </div>
          
          {question.explanation && (
            <div style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              background: '#f9fafb', 
              fontSize: '13px', 
              color: '#374151', 
              lineHeight: '1.5', 
              marginBottom: '8px', 
              whiteSpace: 'pre-line' 
            }}>
              📝 {question.explanation}
            </div>
          )}
          
          <button onClick={nextQuestion}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '999px', 
              border: 'none', 
              background: isCorrect ? '#10b981' : '#7c3aed', 
              color: '#fff', 
              fontWeight: '700', 
              fontSize: '14px', 
              cursor: 'pointer' 
            }}>
            {questionNum < TOTAL_QUESTIONS - 1 ? 'Lanjut ➡️' : '🏆 Selesai!'}
          </button>
        </div>
      )}
    </div>
  );
}