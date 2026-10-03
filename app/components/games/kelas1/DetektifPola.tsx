// app/components/games/kelas1/DetektifPola.tsx
// 🔍 Detektif Pola — pola berulang, berkembang, zigzag, bersarang, campuran angka+bentuk.
// Melatih penalaran logika dasar Kelas 1: "apa berikutnya?", "berapa naiknya?", "mana yang hilang?"
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

// ============================================
// POOL VISUAL
// ============================================
const BENTUK = ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠', '⭐', '❤️', '🔺', '🟩'];
const HEWAN = ['🐤', '🐱', '🐶', '🐰', '🐸', '🐼', '🦊', '🐨'];
const BUAH = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🥝'];
const SEMUA = [...BENTUK, ...HEWAN, ...BUAH];

// ============================================
// HELPER
// ============================================
const ambil = (n: number, pool = BENTUK) => shuffleArr(pool).slice(0, n);

/** Bangun deret berulang dari pola, sepanjang `panjang`, lalu tanya elemen ke-`panjang` */
const deretBerulang = (pola: string[], panjang: number) =>
  Array.from({ length: panjang }, (_, i) => pola[i % pola.length]);

const decoyDariPool = (jawaban: string, pool: string[] = BENTUK, n = 3) =>
  shuffleArr(pool.filter((x) => x !== jawaban)).slice(0, n);

// ============================================
// 1. POLA BERULANG SEDERHANA (AB, ABC, ABCD)
// ============================================
function polaBerulang(tier: 1 | 2 | 3): PowerQuestion {
  const panjang = tier === 1 ? 2 : tier === 2 ? 3 : 4;
  const pola = ambil(panjang, tier === 1 ? BENTUK : SEMUA);
  const tampil = panjang * 2 + (tier === 1 ? 1 : 0);
  const deret = deretBerulang(pola, tampil);
  const jawaban = pola[tampil % panjang];
  return {
    prompt: 'Apa bentuk selanjutnya?',
    visual: deret.join(' ') + '  ❓',
    answer: jawaban,
    options: shuffleArr([jawaban, ...decoyDariPool(jawaban, SEMUA)]),
  };
}

// ============================================
// 2. POLA BERSARANG (AABB, AAABBB)
// ============================================
function polaBersarang(tier: 1 | 2 | 3): PowerQuestion {
  const [a, b] = ambil(2, tier === 1 ? BENTUK : HEWAN);
  const ulang = tier === 1 ? 2 : 3;
  const blok = (x: string) => Array(ulang).fill(x);
  const pola = [...blok(a), ...blok(b)];
  const tampil = pola.length * 2 + 1;
  const deret = deretBerulang(pola, tampil);
  const jawaban = pola[tampil % pola.length];
  return {
    prompt: 'Perhatikan polanya. Apa bentuk selanjutnya?',
    visual: deret.join(' ') + '  ❓',
    answer: jawaban,
    options: shuffleArr([jawaban, ...decoyDariPool(jawaban, SEMUA)]),
  };
}

// ============================================
// 3. POLA BERKEMBANG (1, 2, 3, 4 gambar)
// ============================================
function polaMakinBanyak(tier: 1 | 2 | 3): PowerQuestion {
  const emoji = SEMUA[randInt(0, SEMUA.length - 1)];
  const awal = randInt(1, 2);
  const beda = randInt(1, tier === 1 ? 1 : tier === 2 ? 2 : 3);
  const baris = [awal, awal + beda, awal + 2 * beda];
  const jawaban = awal + 3 * beda;
  const visual = baris.map((n) => emoji.repeat(n)).join('  |  ');
  return {
    prompt: 'Kalau polanya terus bertambah, baris ke-4 ada berapa?',
    visual: `${visual}  |  ❓`,
    answer: jawaban,
    options: shuffleArr(numericOptions(jawaban, Math.max(2, beda + 1), 4)),
  };
}

// ============================================
// 4. POLA BERKEMBANG BERTINGKAT (1, 2, 4, 7, ...)
// ============================================
function polaBertingkat(tier: 1 | 2 | 3): PowerQuestion {
  const emoji = SEMUA[randInt(0, SEMUA.length - 1)];
  const awal = randInt(1, 2);
  const beda1 = randInt(1, 2);
  const beda2 = beda1 + randInt(1, tier === 3 ? 2 : 1);
  const baris = [awal, awal + beda1, awal + beda1 + beda2];
  const jawaban = awal + beda1 + beda2 + (beda2 + 1);
  const visual = baris.map((n) => emoji.repeat(n)).join('  |  ');
  return {
    prompt: 'Selisihnya makin besar. Baris ke-4 ada berapa?',
    visual: `${visual}  |  ❓`,
    answer: jawaban,
    options: shuffleArr(numericOptions(jawaban, 2, 4)),
  };
}

// ============================================
// 5. POLA ZIGZAG / NAIK-TURUN (1,3,5,4,3,2,1)
// ============================================
function polaZigzag(): PowerQuestion {
  const emoji = SEMUA[randInt(0, SEMUA.length - 1)];
  const naik = randInt(1, 2);
  const awal = randInt(1, 2);
  const baris = [awal, awal + naik, awal + 2 * naik, awal + naik, awal];
  const jawaban = Math.max(0, awal - naik);
  const visual = baris.map((n) => emoji.repeat(Math.max(1, n))).join('  |  ');
  return {
    prompt: 'Polanya naik lalu turun. Baris ke-6 ada berapa?',
    visual: `${visual}  |  ❓`,
    answer: jawaban,
    options: shuffleArr(numericOptions(Math.max(1, jawaban), 2, 4)),
  };
}

// ============================================
// 6. POLA HILANG DI TENGAH (bukan di akhir)
// ============================================
function polaHilangTengah(tier: 1 | 2 | 3): PowerQuestion {
  const panjang = tier === 1 ? 2 : 3;
  const pola = ambil(panjang, SEMUA);
  const tampil = panjang * 2 + 1;
  const deret = deretBerulang(pola, tampil);
  const idxHilang = randInt(1, tampil - 2);
  const jawaban = deret[idxHilang];
  deret[idxHilang] = '❓';
  return {
    prompt: 'Ada satu yang hilang. Mana bentuknya?',
    visual: deret.join(' '),
    answer: jawaban,
    options: shuffleArr([jawaban, ...decoyDariPool(jawaban, SEMUA)]),
  };
}

// ============================================
// 7. POLA CAMPURAN ANGKA + BENTUK (mis. 1🔴 2🔵 3🟢)
// ============================================
function polaCampuran(tier: 1 | 2 | 3): PowerQuestion {
  const pool = tier === 1 ? BENTUK : SEMUA;
  const pola = ambil(3, pool);
  const angkaAwal = randInt(1, 2);
  const deret: string[] = [];
  for (let i = 0; i < 4; i++) {
    deret.push(`${angkaAwal + i}${pola[i % pola.length]}`);
  }
  const jawabanAngka = angkaAwal + 4;
  const jawabanBentuk = pola[4 % pola.length];
  const jawaban = `${jawabanAngka}${jawabanBentuk}`;
  const salah = [
    `${jawabanAngka + 1}${jawabanBentuk}`,
    `${jawabanAngka}${pola[(4 + 1) % pola.length]}`,
    `${jawabanAngka - 1}${jawabanBentuk}`,
  ];
  return {
    prompt: 'Angka naik, bentuk bergilir. Apa berikutnya?',
    visual: deret.join('  ') + '  ❓',
    answer: jawaban,
    options: shuffleArr([jawaban, ...salah]),
  };
}

// ============================================
// 8. POLA WARNA POSISI (2 bergantian + 1 muncul tiap 3)
// ============================================
function polaWarnaPosisi(): PowerQuestion {
  const [a, b, c] = ambil(3, BENTUK);
  const deret = [a, b, a, c, a, b, a];
  const jawaban = c;
  return {
    prompt: 'Pola campuran. Apa bentuk selanjutnya?',
    visual: deret.join(' ') + '  ❓',
    answer: jawaban,
    options: shuffleArr([jawaban, ...decoyDariPool(jawaban, BENTUK)]),
  };
}

// ============================================
// DISTRIBUSI SOAL PER TIER
// ============================================
type Generator = () => PowerQuestion;

function pilihSoal(tier: 1 | 2 | 3): PowerQuestion {
  const roll = Math.random();

  if (tier === 1) {
    // Tier 1: pola sederhana, visual jelas
    if (roll < 0.4) return polaBerulang(1);
    if (roll < 0.65) return polaMakinBanyak(1);
    if (roll < 0.85) return polaHilangTengah(1);
    return polaCampuran(1);
  }

  if (tier === 2) {
    // Tier 2: tambah pola bersarang & zigzag
    if (roll < 0.25) return polaBerulang(2);
    if (roll < 0.45) return polaMakinBanyak(2);
    if (roll < 0.6) return polaBersarang(2);
    if (roll < 0.75) return polaHilangTengah(2);
    if (roll < 0.9) return polaCampuran(2);
    return polaZigzag();
  }

  // Tier 3: semua jenis, termasuk bertingkat & warna posisi
  if (roll < 0.15) return polaBerulang(3);
  if (roll < 0.28) return polaMakinBanyak(3);
  if (roll < 0.42) return polaBersarang(3);
  if (roll < 0.55) return polaBertingkat(3);
  if (roll < 0.68) return polaHilangTengah(3);
  if (roll < 0.8) return polaCampuran(3);
  if (roll < 0.9) return polaZigzag();
  return polaWarnaPosisi();
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return pilihSoal(tier);
}

export default function DetektifPola({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Detektif Pola"
      emoji="🔍"
      themeColor="#06b6d4"
      totalRounds={12}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}