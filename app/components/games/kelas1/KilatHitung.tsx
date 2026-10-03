// app/components/games/kelas1/KilatHitung.tsx
// ⚡ Kilat Hitung — fluency & mental math Kelas 1.
// Bukan sekadar drill: setiap soal dirancang supaya bisa dihitung pakai STRATEGI CEPAT
// (pasangan 10, +9 trik +10−1, double, lompat puluhan). Anak belajar CARA, bukan cuma hasil.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr } from '../shared/PowerBattle';

// ============================================
// HELPER
// ============================================
const decoyCerdas = (jawaban: number, min: number, max: number, n = 3): number[] => {
  const set = new Set<number>([jawaban]);
  const kandidat = shuffleArr([
    jawaban + 1, jawaban - 1,
    jawaban + 2, jawaban - 2,
    jawaban + 10, jawaban - 10,   // miskonsepsi khas "salah puluhan"
    jawaban + 9, jawaban - 9,     // miskonsepsi trik +9
  ]);
  for (const k of kandidat) {
    if (set.size >= n + 1) break;
    if (k !== jawaban && k >= min && k <= max && !set.has(k)) set.add(k);
  }
  let guard = 0;
  while (set.size < n + 1 && guard < 40) {
    guard++;
    const k = randInt(min, max);
    if (!set.has(k)) set.add(k);
  }
  return Array.from(set).filter((x) => x !== jawaban).slice(0, n);
};

const q = (
  prompt: string,
  visual: string,
  answer: number,
  min: number,
  max: number,
  strategi: string
): PowerQuestion => ({
  prompt,
  visual,
  answer,
  options: shuffleArr([answer, ...decoyCerdas(answer, min, max)]),
  hint: strategi,
});

// ============================================
// 1. REFLEKS +1, +2, +0
// ============================================
function refleksTambah(): PowerQuestion {
  const a = randInt(2, 18);
  const b = [0, 1, 2][randInt(0, 2)];
  const jawaban = a + b;
  return q(
    `${a} + ${b} = ?`,
    `⚡  ${a}  ➕  ${b}`,
    jawaban,
    Math.max(0, a - 2),
    a + 4,
    b === 0 ? 'Tambah 0 → angkanya tetap!'
      : b === 1 ? 'Tambah 1 → hitung maju 1 langkah'
      : 'Tambah 2 → hitung maju 2 langkah'
  );
}

// ============================================
// 2. TRik +9 dan +8 (tambah 10 kurang 1/2)
// ============================================
function trikPlusSembilan(): PowerQuestion {
  const a = randInt(3, 18);
  const b = Math.random() < 0.6 ? 9 : 8;
  const jawaban = a + b;
  return q(
    `${a} + ${b} = ?`,
    `🧠  ${a}  ➕  ${b}`,
    jawaban,
    a,
    a + 12,
    b === 9
      ? `${a} + 9 = ${a} + 10 − 1 = ${a + 10} − 1 = ${jawaban}`
      : `${a} + 8 = ${a} + 10 − 2 = ${a + 10} − 2 = ${jawaban}`
  );
}

// ============================================
// 3. LOMPAT PULUHAN (+10, +20)
// ============================================
function lompatPuluhan(): PowerQuestion {
  const puluhan = [10, 20][randInt(0, 1)];
  const a = randInt(1, 79);
  const jawaban = a + puluhan;
  return q(
    `${a} + ${puluhan} = ?`,
    `🚀  ${a}  ➕  ${puluhan}`,
    jawaban,
    a,
    Math.min(99, a + 30),
    `+${puluhan} → puluhannya naik, satuannya tetap`
  );
}

// ============================================
// 4. DOUBLE & NEAR DOUBLE
// ============================================
function doubleCepat(): PowerQuestion {
  const a = randInt(2, 9);
  const near = Math.random() < 0.5;
  const b = near ? a + 1 : a;
  const jawaban = a + b;
  return q(
    `${a} + ${b} = ?`,
    `👯  ${a}  ➕  ${b}`,
    jawaban,
    2,
    a * 2 + 3,
    near
      ? `${a} + ${a + 1} = ${a} + ${a} + 1 = ${a + a} + 1 = ${jawaban}`
      : `${a} + ${a} = double dari ${a} = ${jawaban}`
  );
}

// ============================================
// 5. PASANGAN 10 (langsung tahu)
// ============================================
function pasanganSepuluh(): PowerQuestion {
  const a = randInt(1, 9);
  const jawaban = 10 - a;
  return q(
    `${a} + ? = 10`,
    `🔟  ${a}  ➕  ❓  =  10`,
    jawaban,
    1,
    9,
    `Pasangan 10: ${a} + ${jawaban} = 10`
  );
}

// ============================================
// 6. REFLEKS −1, −2
// ============================================
function refleksKurang(): PowerQuestion {
  const a = randInt(5, 20);
  const b = [1, 2][randInt(0, 1)];
  const jawaban = a - b;
  return q(
    `${a} − ${b} = ?`,
    `⚡  ${a}  ➖  ${b}`,
    jawaban,
    0,
    a,
    b === 1 ? 'Kurang 1 → hitung mundur 1 langkah'
      : 'Kurang 2 → hitung mundur 2 langkah'
  );
}

// ============================================
// 7. −9 TRIK (kurang 10 tambah 1)
// ============================================
function trikMinusSembilan(): PowerQuestion {
  const a = randInt(12, 20);
  const b = Math.random() < 0.6 ? 9 : 8;
  const jawaban = a - b;
  return q(
    `${a} − ${b} = ?`,
    `🧠  ${a}  ➖  ${b}`,
    jawaban,
    Math.max(0, a - 12),
    a,
    b === 9
      ? `${a} − 9 = ${a} − 10 + 1 = ${a - 10} + 1 = ${jawaban}`
      : `${a} − 8 = ${a} − 10 + 2 = ${a - 10} + 2 = ${jawaban}`
  );
}

// ============================================
// 8. −10 LOMPAT PULUHAN
// ============================================
function kurangPuluhan(): PowerQuestion {
  const puluhan = [10, 20][randInt(0, 1)];
  const a = randInt(puluhan + 1, 99);
  const jawaban = a - puluhan;
  return q(
    `${a} − ${puluhan} = ?`,
    `🚀  ${a}  ➖  ${puluhan}`,
    jawaban,
    Math.max(0, a - 30),
    a,
    `−${puluhan} → puluhannya turun, satuannya tetap`
  );
}

// ============================================
// 9. KURANG DARI 10 (pakai pasangan 10)
// ============================================
function kurangDariSepuluh(): PowerQuestion {
  const a = randInt(11, 18);
  const b = randInt(a - 9, a - 2); // hasil 2-9
  const jawaban = a - b;
  return q(
    `${a} − ${b} = ?`,
    `💡  ${a}  ➖  ${b}`,
    jawaban,
    1,
    9,
    `Pakai pasangan 10: ${a} − ${a - 10} = 10, lalu 10 − ${b - (a - 10)} = ${jawaban}`
  );
}

// ============================================
// 10. TAMBAH LEWAT 10 (7 + 5 → 7 + 3 + 2)
// ============================================
function tambahLewatSepuluh(): PowerQuestion {
  const a = randInt(5, 9);
  const b = randInt(11 - a, 9); // b dibuat supaya a+b > 10
  const jawaban = a + b;
  const pelengkap = 10 - a;
  const sisa = b - pelengkap;
  return q(
    `${a} + ${b} = ?`,
    `🎯  ${a}  ➕  ${b}`,
    jawaban,
    10,
    20,
    `Lewat 10: ${a} + ${pelengkap} = 10, lalu 10 + ${sisa} = ${jawaban}`
  );
}

// ============================================
// DISTRIBUSI PER TIER
// ============================================
function pilihSoal(tier: 1 | 2 | 3): PowerQuestion {
  const roll = Math.random();

  if (tier === 1) {
    // Tier 1: refleks + pasangan 10 + double
    if (roll < 0.25) return refleksTambah();
    if (roll < 0.45) return pasanganSepuluh();
    if (roll < 0.65) return doubleCepat();
    if (roll < 0.85) return refleksKurang();
    return lompatPuluhan();
  }

  if (tier === 2) {
    // Tier 2: trik +9, −9, lompat puluhan
    if (roll < 0.18) return refleksTambah();
    if (roll < 0.35) return trikPlusSembilan();
    if (roll < 0.5) return trikMinusSembilan();
    if (roll < 0.65) return lompatPuluhan();
    if (roll < 0.8) return kurangPuluhan();
    return doubleCepat();
  }

  // Tier 3: semua strategi, termasuk lewat 10 & kurang dari 10
  if (roll < 0.12) return trikPlusSembilan();
  if (roll < 0.24) return trikMinusSembilan();
  if (roll < 0.38) return tambahLewatSepuluh();
  if (roll < 0.52) return kurangDariSepuluh();
  if (roll < 0.66) return lompatPuluhan();
  if (roll < 0.78) return kurangPuluhan();
  if (roll < 0.9) return doubleCepat();
  return pasanganSepuluh();
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return pilihSoal(tier);
}

export default function KilatHitung({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Kilat Hitung"
      emoji="⚡"
      themeColor="#eab308"
      totalRounds={12}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}