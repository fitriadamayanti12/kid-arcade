// lib/mastery/kelas3.ts
// ⚡ Perkalian Kilat — kuasai tabel 2–10 lewat trik + latihan adaptif (fakta yang lemah lebih sering muncul)
import type { MasteryConfig, MasteryGroup, MasteryQuestion } from './types';

const AXIS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Fakta perkalian dianggap sama untuk a×b dan b×a (a ≤ b) */
export function factKey(a: number, b: number): string {
  return `m:${Math.min(a, b)}-${Math.max(a, b)}`;
}

// Urutan prioritas pemilihan trik: mana yang paling mudah dipakai duluan
const TRICK_ORDER = [10, 5, 2, 9, 4, 3, 6, 7, 8];

function trickLine(f: number, n: number): string {
  switch (f) {
    case 10:
      return `Kali 10 tinggal tambah angka 0 di belakang: ${n} × 10 = ${n * 10}.`;
    case 5:
      return `Kali 5 = separuh dari kali 10: ${n} × 10 = ${n * 10}, setengahnya ${n * 5}.`;
    case 2:
      return `Kali 2 = dobel: ${n} + ${n} = ${n * 2}.`;
    case 9:
      return `Kali 9 = kali 10 dikurangi satu ${n}: ${n * 10} − ${n} = ${n * 9}.`;
    case 4:
      return `Kali 4 = dobel dua kali: ${n} → ${n * 2} → ${n * 4}.`;
    case 3:
      return `Kali 3 = dobel, lalu tambah ${n} lagi: ${n * 2} + ${n} = ${n * 3}.`;
    case 6:
      return `Kali 6 = kali 5 ditambah ${n}: ${n * 5} + ${n} = ${n * 6}.`;
    case 7:
      return `Kali 7 = kali 5 ditambah kali 2: ${n * 5} + ${n * 2} = ${n * 7}.`;
    default:
      return `Kali 8 = dobel tiga kali: ${n} → ${n * 2} → ${n * 4} → ${n * 8}.`;
  }
}

function makeQuestion(skill: string): MasteryQuestion {
  const [lo, hi] = skill.replace('m:', '').split('-').map(Number);
  const product = lo * hi;

  // trik: pilih faktor dengan prioritas tertinggi, terapkan ke faktor lainnya
  const f = TRICK_ORDER.find((t) => t === lo || t === hi) as number;
  const n = f === lo ? hi : lo;

  const explain = [
    `${lo} × ${hi} = ${product}.`,
    trickLine(f, n),
    `Keluarga fakta: ${lo} × ${hi} = ${hi} × ${lo} = ${product}, dan ${product} ÷ ${lo} = ${hi}.`,
  ];

  const [x, y] = Math.random() > 0.5 ? [lo, hi] : [hi, lo];
  const r = Math.random();
  let prompt: string;
  let answer: number;

  if (r < 0.6) {
    prompt = `${x} × ${y} = ?`;
    answer = product;
  } else if (r < 0.8) {
    // faktor yang hilang
    const hideFirst = Math.random() > 0.5;
    prompt = hideFirst ? `? × ${y} = ${product}` : `${x} × ? = ${product}`;
    answer = hideFirst ? x : y;
  } else {
    // pembagian (kebalikan perkalian)
    prompt = `${product} ÷ ${x} = ?`;
    answer = y;
  }

  return {
    prompt,
    answer: String(answer),
    input: 'number',
    explain,
    explainVisual: { kind: 'array', rows: lo, cols: hi },
    fastMs: 5000,
  };
}

const TRICK_LESSON: Record<number, string> = {
  2: 'Kali 2 = dobel. 2 × 7 → 7 + 7 = 14.',
  3: 'Kali 3 = dobel lalu tambah satu lagi. 3 × 7 → 14 + 7 = 21.',
  4: 'Kali 4 = dobel dua kali. 4 × 6 → 12 → 24.',
  5: 'Kali 5 = separuh dari kali 10. 5 × 8 → 80 → 40. Hasilnya selalu berakhiran 0 atau 5.',
  6: 'Kali 6 = kali 5 lalu tambah satu lagi. 6 × 7 → 35 + 7 = 42.',
  7: 'Kali 7 = kali 5 ditambah kali 2. 7 × 8 → 40 + 16 = 56.',
  8: 'Kali 8 = dobel tiga kali. 8 × 6 → 12 → 24 → 48.',
  9: 'Kali 9 = kali 10 dikurangi satu. 9 × 7 → 70 − 7 = 63. Puluhan + satuan selalu 9 (6 + 3).',
  10: 'Kali 10 = tambah angka 0 di belakang. 10 × 6 = 60.',
};

const ORDER = [2, 5, 10, 3, 4, 9, 6, 7, 8];

function tableGroup(t: number): MasteryGroup {
  return {
    id: `t${t}`,
    label: `Kali ${t}`,
    emoji: t <= 5 || t === 10 ? '🟢' : t === 9 || t === 4 ? '🟡' : '🔴',
    skills: AXIS.map((k) => factKey(t, k)),
    lesson: {
      title: `Tabel ${t}`,
      points: [
        TRICK_LESSON[t],
        'Target: jawab benar dalam kurang dari 5 detik.',
        'Ingat: 3 × 7 sama dengan 7 × 3 — belajar satu, dapat dua!',
      ],
    },
  };
}

const allFacts: string[] = [];
for (let a = 2; a <= 10; a++) for (let b = a; b <= 10; b++) allFacts.push(factKey(a, b));

export const kelas3Config: MasteryConfig = {
  gameId: 'kalikilat3',
  title: 'Perkalian Kilat',
  emoji: '⚡',
  color: '#8b5cf6',
  tagline: 'Hafal tabel perkalian pakai trik jitu — fakta yang masih lemah otomatis lebih sering muncul!',
  sessionLength: 12,
  sequential: false,
  passAccuracy: 0.8,
  makeQuestion,
  skillLabel: (skill) => {
    const [a, b] = skill.replace('m:', '').split('-');
    return `${a} × ${b}`;
  },
  heatmap: {
    title: 'Peta Penguasaan Perkalian',
    axis: AXIS,
    keyFor: factKey,
  },
  groups: [
    ...ORDER.map(tableGroup),
    {
      id: 'ujian',
      label: 'Ujian Kilat',
      emoji: '🏆',
      skills: allFacts,
      lesson: {
        title: 'Ujian semua tabel',
        points: [
          'Semua tabel 2–10 diacak. Soal yang masih lemah lebih sering muncul.',
          'Ada 3 jenis soal: a × b, faktor yang hilang, dan pembagian.',
        ],
      },
    },
  ],
};
