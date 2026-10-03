// app/components/games/kelas1/TebakCepat.tsx
// 👀 Tebak Cepat — SUBITIZING lengkap: pola dadu, domino, ten-frame, kelompok, subitizing +,
// subitizing −, banding cepat. Fondasi number sense & berhitung super cepat Kelas 1.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

// ============================================
// POOL VISUAL
// ============================================
const BUAH = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🥝', '🍑', '🍋'];
const HEWAN = ['🐤', '🐱', '🐶', '🐰', '🐸', '🐼', '🦊', '🐨', '🐷', '🐢'];
const BENDA = ['⭐', '❤️', '🎈', '🍩', '🍪', '🌸', '🌼', '🔺', '🔵', '🟢'];
const SEMUA = [...BUAH, ...HEWAN, ...BENDA];

const acakDari = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// ============================================
// POLA DADU ASLI (dot patterns) — cara otak mengenali angka paling cepat
// ============================================
const DADU_LAYOUT: Record<number, string[]> = {
  1: ['     ', '  ●  ', '     '],
  2: ['●    ', '     ', '    ●'],
  3: ['●    ', '  ●  ', '    ●'],
  4: ['●   ●', '     ', '●   ●'],
  5: ['●   ●', '  ●  ', '●   ●'],
  6: ['●   ●', '●   ●', '●   ●'],
  7: ['●   ●', '  ●  ', '● ● ●'],
  8: ['● ● ●', '  ●  ', '● ● ●'],
  9: ['● ● ●', '●   ●', '● ● ●'],
  10: ['● ● ●', '● ● ●', '● ● ●', '●     '],
};

// ============================================
// HELPER
// ============================================
const decoyAngka = (jawaban: number, min: number, max: number, n = 3): number[] => {
  const set = new Set<number>([jawaban]);
  const kandidat = shuffleArr([
    jawaban + 1, jawaban - 1,
    jawaban + 2, jawaban - 2,
    // miskonsepsi umum anak: mengira baris = angka
    Math.max(min, jawaban / 2),
    jawaban * 2,
    min, max,
  ]);
  for (const k of kandidat) {
    if (set.size >= n + 1) break;
    const bulat = Math.round(k);
    if (bulat !== jawaban && bulat >= min && bulat <= max && !set.has(bulat)) set.add(bulat);
  }
  let guard = 0;
  while (set.size < n + 1 && guard < 40) {
    guard++;
    const k = randInt(min, max);
    if (!set.has(k)) set.add(k);
  }
  return Array.from(set).filter((x) => x !== jawaban).slice(0, n);
};

// ============================================
// RENDER POLA BARIS (baris sederhana)
// ============================================
function renderBaris(count: number, emoji: string, perBaris?: number): string {
  const p = perBaris ?? (count <= 3 ? count : count <= 5 ? 2 : count <= 8 ? 3 : 5);
  const rows: string[] = [];
  let sisa = count;
  while (sisa > 0) {
    const ambil = Math.min(p, sisa);
    rows.push(emoji.repeat(ambil));
    sisa -= ambil;
  }
  return rows.join('\n');
}

// ============================================
// RENDER DADU ASLI
// ============================================
function renderDadu(count: number, emoji: string = '●'): string {
  const layout = DADU_LAYOUT[count];
  if (layout) {
    return layout
      .map((baris) => baris.replace(/●/g, emoji).replace(/ /g, ' '))
      .join('\n');
  }
  return renderBaris(count, emoji);
}

// ============================================
// RENDER KELOMPOK (2 atau 3 gugusan)
// ============================================
function renderKelompok(count: number, emoji: string): string {
  const kelompok = count <= 4 ? 2 : 3;
  const perKelompok = Math.ceil(count / kelompok);
  const bagian: string[] = [];
  let sisa = count;
  for (let i = 0; i < kelompok && sisa > 0; i++) {
    const ambil = Math.min(perKelompok, sisa);
    bagian.push(emoji.repeat(ambil));
    sisa -= ambil;
  }
  return bagian.join('   ');
}

// ============================================
// RENDER TEN-FRAME (kotak 5 atau 10)
// ============================================
function renderTenFrame(count: number, total: number = 10): string {
  const terisi = Array(total).fill(0).map((_, i) => (i < count ? '⬛' : '⬜'));
  const perBaris = total <= 10 ? 5 : 10;
  const baris: string[] = [];
  for (let i = 0; i < total; i += perBaris) {
    baris.push(terisi.slice(i, i + perBaris).join(''));
  }
  return baris.join('\n');
}

// ============================================
// 1. SUBITIZING DASAR (baris sederhana, 1-5)
// ============================================
function subitizeDasar(max: number): PowerQuestion {
  const count = randInt(2, max);
  const emoji = acakDari(SEMUA);
  return {
    prompt: 'Berapa banyak? Lihat cepat, jangan hitung satu-satu!',
    visual: renderBaris(count, emoji),
    answer: count,
    options: shuffleArr([count, ...decoyAngka(count, 1, max + 2)]),
  };
}

// ============================================
// 2. POLA DADU (dot pattern klasik)
// ============================================
function subitizeDadu(): PowerQuestion {
  const count = randInt(2, 6);
  const emoji = acakDari(['🔵', '🔴', '⚫', '🟢', '🟣', '🟡']);
  return {
    prompt: 'Berapa titiknya? Lihat cepat!',
    visual: renderDadu(count, emoji),
    answer: count,
    options: shuffleArr([count, ...decoyAngka(count, 1, 9)]),
  };
}

// ============================================
// 3. POLA DOMINO (dua kelompok dadu)
// ============================================
function subitizeDomino(): PowerQuestion {
  const kiri = randInt(1, 4);
  const kanan = randInt(1, 4);
  const total = kiri + kanan;
  const emoji = acakDari(['🔵', '🔴', '🟢']);
  const visual = renderDadu(kiri, emoji) + '  |  ' + renderDadu(kanan, emoji);
  return {
    prompt: 'Berapa jumlah titik kiri + kanan?',
    visual,
    answer: total,
    options: shuffleArr([total, ...decoyAngka(total, 2, 8)]),
  };
}

// ============================================
// 4. TEN-FRAME (kotak isi)
// ============================================
function subitizeTenFrame(): PowerQuestion {
  const total = Math.random() < 0.6 ? 10 : 20;
  const count = randInt(2, total - 1);
  return {
    prompt: 'Berapa kotak hitam? Lihat cepat!',
    visual: renderTenFrame(count, total),
    answer: count,
    options: shuffleArr([count, ...decoyAngka(count, 1, total)]),
  };
}

// ============================================
// 5. KELOMPOK (2 atau 3 gugusan)
// ============================================
function subitizeKelompok(): PowerQuestion {
  const count = randInt(4, 9);
  const emoji = acakDari(SEMUA);
  return {
    prompt: 'Ada berapa kelompok ini? Lihat cepat!',
    visual: renderKelompok(count, emoji),
    answer: count,
    options: shuffleArr([count, ...decoyAngka(count, 2, 12)]),
  };
}

// ============================================
// 6. SUBITIZING + (lihat 2 kelompok, jumlahkan)
// ============================================
function subitizeTambah(): PowerQuestion {
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const total = a + b;
  const emoji = acakDari(['🔵', '🔴', '⚫']);
  const visual = renderDadu(a, '🔵') + '   ➕   ' + renderDadu(b, '🔴');
  return {
    prompt: 'Berapa jumlah semua titik?',
    visual,
    answer: total,
    options: shuffleArr([total, ...decoyAngka(total, 2, 10)]),
  };
}

// ============================================
// 7. SUBITIZING − (kelompok besar, sebagian dicoret)
// ============================================
function subitizeKurang(): PowerQuestion {
  const total = randInt(5, 10);
  const diambil = randInt(1, total - 2);
  const sisa = total - diambil;
  const emoji = '🍎';
  const diambilVisual = '❌';
  const barisTotal = emoji.repeat(sisa) + diambilVisual.repeat(diambil);
  return {
    prompt: `Ada ${total} ${emoji}. Yang dicoret diambil.\nBerapa sisa yang tidak dicoret?`,
    visual: barisTotal,
    answer: sisa,
    options: shuffleArr([sisa, ...decoyAngka(sisa, 1, total)]),
  };
}

// ============================================
// 8. BANDING CEPAT (mana lebih banyak)
// ============================================
function subitizeBanding(): PowerQuestion {
  const emoji = acakDari(SEMUA);
  let a = randInt(2, 7);
  let b = randInt(2, 7);
  while (a === b) b = randInt(2, 7);
  const jawaban = a > b ? 'Kiri' : 'Kanan';
  return {
    prompt: 'Mana yang lebih banyak? Lihat cepat!',
    visual: `Kiri:  ${emoji.repeat(a)}\n\nKanan: ${emoji.repeat(b)}`,
    answer: jawaban,
    options: shuffleArr(['Kiri', 'Kanan']),
  };
}

// ============================================
// 9. DADU + BENTUK BERGANTIAN (pola cepat)
// ============================================
function subitizePola(): PowerQuestion {
  const emojiA = acakDari(['🔵', '🔴', '🟢']);
  const emojiB = acakDari(['⭐', '❤️', '🌸', '🎈']);
  const n = randInt(3, 6);
  const deret: string[] = [];
  for (let i = 0; i < n; i++) deret.push(i % 2 === 0 ? emojiA : emojiB);
  const hitung = deret.filter((x) => x === emojiA).length;
  return {
    prompt: `Berapa banyak ${emojiA}? Lihat cepat!`,
    visual: deret.join(' '),
    answer: hitung,
    options: shuffleArr([hitung, ...decoyAngka(hitung, 1, n)]),
  };
}

// ============================================
// 10. TEBAK JUMLAH SETELAH DITAMBAH (visual cepat)
// ============================================
function subitizeFlash(): PowerQuestion {
  const a = randInt(2, 6);
  const b = randInt(1, 3);
  const emoji = acakDari(SEMUA);
  const visual = `${emoji.repeat(a)}  ➕  ${emoji.repeat(b)}`;
  return {
    prompt: 'Lihat sekilas. Berapa totalnya?',
    visual,
    answer: a + b,
    options: shuffleArr([a + b, ...decoyAngka(a + b, 2, 10)]),
  };
}

// ============================================
// DISTRIBUSI SOAL PER TIER
// ============================================
function pilihSoal(tier: 1 | 2 | 3): PowerQuestion {
  const roll = Math.random();

  if (tier === 1) {
    // Tier 1: subitizing murni 1-5, visual sangat jelas
    if (roll < 0.25) return subitizeDasar(5);
    if (roll < 0.45) return subitizeDadu();
    if (roll < 0.6) return subitizeKelompok();
    if (roll < 0.75) return subitizePola();
    if (roll < 0.9) return subitizeBanding();
    return subitizeTenFrame();
  }

  if (tier === 2) {
    // Tier 2: +, −, domino, ten-frame
    if (roll < 0.15) return subitizeDasar(8);
    if (roll < 0.3) return subitizeDomino();
    if (roll < 0.45) return subitizeTambah();
    if (roll < 0.6) return subitizeKurang();
    if (roll < 0.75) return subitizeTenFrame();
    if (roll < 0.9) return subitizeKelompok();
    return subitizeBanding();
  }

  // Tier 3: kombinasi cepat, visual lebih padat
  if (roll < 0.12) return subitizeDasar(10);
  if (roll < 0.28) return subitizeDomino();
  if (roll < 0.45) return subitizeTambah();
  if (roll < 0.6) return subitizeKurang();
  if (roll < 0.75) return subitizeFlash();
  if (roll < 0.88) return subitizePola();
  return subitizeBanding();
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return pilihSoal(tier);
}

export default function TebakCepat({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Tebak Cepat"
      emoji="👀"
      themeColor="#f97316"
      totalRounds={12}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}