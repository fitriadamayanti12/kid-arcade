// app/components/games/kelas1/PasanganPintar.tsx
// 🔗 Pasangan Pintar — NUMBER BONDS Kelas 1: pasangan 5, 10, 20, double, fakta keluarga,
// bond tersembunyi (3 angka), dan variasi posisi kosong. Fondasi mental math cepat.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

// ============================================
// HELPER
// ============================================
const acakDari = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

/** Pengecoh angka cerdas: dekat jawaban, tapi tidak sama & masih masuk akal (>=1, <= target) */
const decoyAngka = (jawaban: number, min: number, max: number, n = 3): number[] => {
  const set = new Set<number>([jawaban]);
  let guard = 0;
  const kandidat = [
    jawaban + 1, jawaban - 1,
    jawaban + 2, jawaban - 2,
    jawaban + 3, jawaban - 3,
    jawaban + 4, jawaban - 4,
    // pengecoh "miskonsepsi umum" — anak sering salah di sini
    min + max - jawaban + 1,   // kebalikan salah hitung
    max - jawaban,             // kalau salah pakai target lain
  ];
  const shuffled = shuffleArr(kandidat);
  for (const k of shuffled) {
    if (set.size >= n + 1) break;
    if (k !== jawaban && k >= min && k <= max && !set.has(k)) set.add(k);
  }
  while (set.size < n + 1 && guard < 40) {
    guard++;
    const k = randInt(min, max);
    if (!set.has(k)) set.add(k);
  }
  return Array.from(set).filter((x) => x !== jawaban).slice(0, n);
};

// ============================================
// 1. BOND DASAR (posisi kosong di kanan)
// ============================================
function bondKanan(target: number): PowerQuestion {
  const given = randInt(1, target - 1);
  const answer = target - given;
  return {
    prompt: `${given} + ? = ${target}\nBerapa pasangan yang tepat?`,
    visual: `🔗  ${given}  ➕  ❓  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 1)]),
  };
}

// ============================================
// 2. BOND KIRI (posisi kosong di kiri)
// ============================================
function bondKiri(target: number): PowerQuestion {
  const given = randInt(1, target - 1);
  const answer = target - given;
  return {
    prompt: `? + ${given} = ${target}\nBerapa angka yang hilang?`,
    visual: `🔗  ❓  ➕  ${given}  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 1)]),
  };
}

// ============================================
// 3. BOND TENGAH (? di tengah, dua angka diketahui)
// ============================================
function bondTengah(target: number): PowerQuestion {
  const a = randInt(1, target - 2);
  const c = randInt(1, target - a - 1);
  const answer = target - a - c;
  if (answer < 1) return bondKanan(target);
  return {
    prompt: `${a} + ? + ${c} = ${target}\nBerapa angka yang hilang?`,
    visual: `🔗  ${a}  ➕  ❓  ➕  ${c}  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 2)]),
  };
}

// ============================================
// 4. TEN-FRAME VISUAL (lihat pasangan 10)
// ============================================
function tenFrameQuestion(target: 10 | 20): PowerQuestion {
  const given = randInt(1, target - 1);
  const answer = target - given;
  const kotak = target === 10 ? 10 : 20;
  const terisi = Array(kotak).fill(0).map((_, i) => (i < given ? '🟦' : '⬜'));
  const baris = kotak === 10
    ? [terisi.slice(0, 5).join(''), terisi.slice(5).join('')]
    : [terisi.slice(0, 5).join(''), terisi.slice(5, 10).join(''), terisi.slice(10, 15).join(''), terisi.slice(15).join('')];
  return {
    prompt: `Berapa kotak kosong lagi supaya penuh ${target}?`,
    visual: baris.join('\n'),
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 1)]),
  };
}

// ============================================
// 5. DOUBLE & NEAR DOUBLE
// ============================================
function doubleQuestion(max: number): PowerQuestion {
  const a = randInt(2, max);
  const answer = a + a;
  return {
    prompt: `Berapa ${a} + ${a}? (angka kembar)`,
    visual: `👯  ${a}  ➕  ${a}  =  ❓`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 2, max * 2)]),
  };
}

function nearDoubleQuestion(max: number): PowerQuestion {
  const a = randInt(2, max);
  const answer = a + a + 1;
  return {
    prompt: `${a} + ${a + 1} = ?\nPetunjuk: pakai double ${a} + ${a} dulu.`,
    visual: `➕  ${a}  ➕  ${a + 1}  =  ❓`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 2, max * 2 + 2)]),
  };
}

// ============================================
// 6. FAKTA KELUARGA (3 + 7 = 10 → 10 − 3 = ?)
// ============================================
function faktaKeluarga(target: number): PowerQuestion {
  const a = randInt(2, target - 2);
  const b = target - a;
  // bentuk: kalau a + b = target, maka target − a = ?
  const tanya = Math.random() < 0.5 ? b : a;
  const answer = tanya;
  return {
    prompt: `${a} + ${b} = ${target}.\nKalau begitu, ${target} − ${a} = ?`,
    visual: `👨‍👩‍👧  ${a}  ➕  ${b}  =  ${target}\n     ${target}  ➖  ${a}  =  ❓`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 1)]),
  };
}

// ============================================
// 7. BOND TERSEMBUNYI (3 angka jumlah target)
// ============================================
function bondTersembunyi(target: number): PowerQuestion {
  const a = randInt(1, Math.floor(target / 3));
  const b = randInt(1, Math.floor((target - a) / 2));
  const answer = target - a - b;
  if (answer < 1) return bondTengah(target);
  return {
    prompt: `${a} + ${b} + ? = ${target}\nBerapa pasangan terakhirnya?`,
    visual: `🎁  ${a}  ➕  ${b}  ➕  ❓  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 2)]),
  };
}

// ============================================
// 8. BOND CERITA MINI
// ============================================
const CERITA_BOND = [
  { obj: '🍬', nama: 'permen' },
  { obj: '🎈', nama: 'balon' },
  { obj: '🍪', nama: 'kue' },
  { obj: '⚽', nama: 'bola' },
  { obj: '🐤', nama: 'anak ayam' },
];

function bondCerita(target: number): PowerQuestion {
  const { obj, nama } = acakDari(CERITA_BOND);
  const diberikan = randInt(1, target - 1);
  const answer = target - diberikan;
  return {
    prompt: `Ibu punya ${target} ${nama}. Diberi ${diberikan} ke adik.\nBerapa yang tersisa?`,
    visual: `${obj.repeat(diberikan)}  ➕  ❓  =  ${obj.repeat(Math.min(target, 10))}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 0, target)]),
  };
}

// ============================================
// 9. BOND KE 5 (paling dasar — khusus tier 1)
// ============================================
function bondKe5(): PowerQuestion {
  const given = randInt(1, 4);
  const answer = 5 - given;
  return {
    prompt: `Berapa lagi supaya ${given} jadi 5?`,
    visual: `🖐️  ${given}  ➕  ❓  =  5`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, 4)]),
  };
}

// ============================================
// 10. BOND KE 100 (tier 3 — kelipatan 10)
// ============================================
function bondKe100(): PowerQuestion {
  const given = randInt(1, 9) * 10;
  const answer = 100 - given;
  return {
    prompt: `${given} + ? = 100\nBerapa pasangannya?`,
    visual: `💯  ${given}  ➕  ❓  =  100`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 10, 90).map((x) => Math.round(x / 10) * 10)]),
  };
}

// ============================================
// DISTRIBUSI SOAL PER TIER
// ============================================
function pilihSoal(tier: 1 | 2 | 3): PowerQuestion {
  const roll = Math.random();

  if (tier === 1) {
    // Tier 1: fokus bond 5 & 10, visual jelas
    if (roll < 0.2) return bondKe5();
    if (roll < 0.45) return bondKanan(10);
    if (roll < 0.6) return tenFrameQuestion(10);
    if (roll < 0.75) return doubleQuestion(5);
    if (roll < 0.9) return bondCerita(10);
    return bondKiri(10);
  }

  if (tier === 2) {
    // Tier 2: bond 10 & 20, tambah posisi kosong & fakta keluarga
    if (roll < 0.15) return bondKanan(10);
    if (roll < 0.3) return bondKiri(10);
    if (roll < 0.45) return bondTengah(10);
    if (roll < 0.6) return bondKanan(20);
    if (roll < 0.72) return nearDoubleQuestion(9);
    if (roll < 0.85) return faktaKeluarga(10);
    return bondCerita(20);
  }

  // Tier 3: bond 20 & 100, bond tersembunyi, ten-frame 20
  if (roll < 0.12) return bondKanan(20);
  if (roll < 0.24) return bondTengah(20);
  if (roll < 0.36) return bondTersembunyi(20);
  if (roll < 0.48) return tenFrameQuestion(20);
  if (roll < 0.6) return faktaKeluarga(20);
  if (roll < 0.72) return nearDoubleQuestion(12);
  if (roll < 0.85) return bondKe100();
  return bondCerita(20);
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return pilihSoal(tier);
}

export default function PasanganPintar({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Pasangan Pintar"
      emoji="🔗"
      themeColor="#3b82f6"
      totalRounds={12}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}