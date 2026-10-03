// app/components/games/kelas1/PasanganPintar.tsx
// 🔗 Pasangan Pintar — NUMBER BONDS Kelas 1: pasangan 5, 10, 20, double, fakta keluarga,
// bond tersembunyi (3 angka), dan variasi posisi kosong. Fondasi mental math cepat.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr } from '../shared/PowerBattle';

// ============================================
// HELPER
// ============================================
const acakDari = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

/** Pengecoh angka cerdas: dekat jawaban, tapi tidak sama & masih masuk akal (>=min, <=max) */
const decoyAngka = (jawaban: number, min: number, max: number, n = 3): number[] => {
  const set = new Set<number>([jawaban]);
  const kandidat = shuffleArr([
    jawaban + 1, jawaban - 1,
    jawaban + 2, jawaban - 2,
    jawaban + 3, jawaban - 3,
    jawaban + 4, jawaban - 4,
    min + max - jawaban,   // miskonsepsi: anggap total salah
    max - jawaban,
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

/** Buat baris ten-frame dengan angka di bawahnya */
const renderTenFrame = (terisi: number, total: number): string => {
  const kotak = Array(total).fill(0).map((_, i) => (i < terisi ? '🟦' : '⬜'));
  const perBaris = total <= 10 ? 5 : 10;
  const baris: string[] = [];
  for (let i = 0; i < total; i += perBaris) {
    baris.push(kotak.slice(i, i + perBaris).join(''));
  }
  return baris.join('\n');
};

// ============================================
// 1. BOND DASAR (kosong di kanan)
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
// 2. BOND KIRI (kosong di kiri)
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
// 3. BOND TENGAH (kosong di tengah)
// ============================================
function bondTengah(target: number): PowerQuestion {
  const a = randInt(1, target - 2);
  const c = randInt(1, target - a - 1);
  const answer = target - a - c;
  return {
    prompt: `${a} + ? + ${c} = ${target}\nBerapa angka yang hilang?`,
    visual: `🔗  ${a}  ➕  ❓  ➕  ${c}  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 2)]),
  };
}

// ============================================
// 4. TEN-FRAME VISUAL
// ============================================
function tenFrameQuestion(target: 10 | 20): PowerQuestion {
  const given = randInt(1, target - 1);
  const answer = target - given;
  return {
    prompt: `Ada ${given} kotak terisi. Berapa kotak kosong lagi supaya penuh ${target}?`,
    visual: renderTenFrame(given, target),
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
    options: shuffleArr([answer, ...decoyAngka(answer, 2, answer + 6)]),
  };
}

function nearDoubleQuestion(max: number): PowerQuestion {
  const a = randInt(2, max);
  const answer = a + a + 1;
  return {
    prompt: `${a} + ${a + 1} = ?\nPetunjuk: pakai double ${a} + ${a} = ${a + a} dulu.`,
    visual: `➕  ${a}  ➕  ${a + 1}  =  ❓`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 2, answer + 6)]),
  };
}

// ============================================
// 6. FAKTA KELUARGA (3 + 7 = 10 → 10 − 3 = ?)
// ============================================
function faktaKeluarga(target: number): PowerQuestion {
  const a = randInt(2, target - 2);
  const b = target - a;
  // Pertanyaan selalu: target − a = ? → jawabannya b
  return {
    prompt: `Kalau ${a} + ${b} = ${target},\nberapa ${target} − ${a}?`,
    visual: `👨‍👩‍👧  ${a}  ➕  ${b}  =  ${target}\n     ${target}  ➖  ${a}  =  ❓`,
    answer: b,
    options: shuffleArr([b, ...decoyAngka(b, 1, target - 1)]),
  };
}

// ============================================
// 7. BOND TERSEMBUNYI (3 angka jumlah target)
// ============================================
function bondTersembunyi(target: number): PowerQuestion {
  const a = randInt(1, Math.floor(target / 3));
  const b = randInt(1, Math.floor((target - a) / 2));
  const answer = target - a - b;
  return {
    prompt: `${a} + ${b} + ? = ${target}\nBerapa pasangan terakhirnya?`,
    visual: `🎁  ${a}  ➕  ${b}  ➕  ❓  =  ${target}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 1, target - 2)]),
  };
}

// ============================================
// 8. BOND CERITA MINI (visual diperbaiki)
// ============================================
const CERITA_BOND = [
  { obj: '🍬', nama: 'permen', satuan: 'permen' },
  { obj: '🎈', nama: 'balon', satuan: 'balon' },
  { obj: '🍪', nama: 'kue', satuan: 'kue' },
  { obj: '⚽', nama: 'bola', satuan: 'bola' },
  { obj: '🐤', nama: 'anak ayam', satuan: 'anak ayam' },
];

function bondCerita(target: number): PowerQuestion {
  const { obj, nama } = acakDari(CERITA_BOND);
  const diberikan = randInt(1, target - 1);
  const answer = target - diberikan;
  // Visual: baris atas semua objek, baris bawah yang diambil dicoret
  const semua = obj.repeat(target);
  const dicoret = '❌'.repeat(diberikan) + obj.repeat(answer);
  return {
    prompt: `Ibu punya ${target} ${nama}.\nDiberi ${diberikan} ke adik. Berapa sisanya?`,
    visual: `${semua}\n${dicoret}`,
    answer,
    options: shuffleArr([answer, ...decoyAngka(answer, 0, target)]),
  };
}

// ============================================
// 9. BOND KE 5
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
// 10. BOND KE 100
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
    if (roll < 0.2) return bondKe5();
    if (roll < 0.45) return bondKanan(10);
    if (roll < 0.6) return tenFrameQuestion(10);
    if (roll < 0.75) return doubleQuestion(5);
    if (roll < 0.9) return bondCerita(10);
    return bondKiri(10);
  }

  if (tier === 2) {
    if (roll < 0.15) return bondKanan(10);
    if (roll < 0.3) return bondKiri(10);
    if (roll < 0.45) return bondTengah(10);
    if (roll < 0.6) return bondKanan(20);
    if (roll < 0.72) return nearDoubleQuestion(9);
    if (roll < 0.85) return faktaKeluarga(10);
    return bondCerita(20);
  }

  // Tier 3
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