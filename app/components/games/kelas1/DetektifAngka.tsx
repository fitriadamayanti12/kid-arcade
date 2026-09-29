// app/components/games/kelas1/DetektifAngka.tsx
// 🔍 Detektif Angka — deduksi dari beberapa petunjuk sekaligus untuk menemukan 1 angka rahasia.
// Ini inti dari penalaran logika ala olimpiade: menggabungkan info, bukan sekadar berhitung.
// Setiap soal DIVERIFIKASI saat dibuat: dicek ulang ke seluruh rentang angka supaya jawabannya
// dijamin tunggal (tidak ambigu) sebelum ditampilkan ke anak.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr } from '../shared/PowerBattle';

type Clue = { text: string; test: (n: number) => boolean };

function makeClues(secret: number, max: number, count: number): Clue[] {
  const pool: Clue[] = [];

  pool.push(
    secret % 2 === 0
      ? { text: 'Aku adalah angka genap.', test: (n) => n % 2 === 0 }
      : { text: 'Aku adalah angka ganjil.', test: (n) => n % 2 === 1 }
  );

  const gtMargin = randInt(1, 3);
  const gtBound = secret - gtMargin;
  if (gtBound >= 0) pool.push({ text: `Aku lebih besar dari ${gtBound}.`, test: (n) => n > gtBound });

  const ltMargin = randInt(1, 3);
  const ltBound = secret + ltMargin;
  if (ltBound <= max + 1) pool.push({ text: `Aku lebih kecil dari ${ltBound}.`, test: (n) => n < ltBound });

  if (secret >= 10) {
    const ones = secret % 10;
    pool.push({ text: `Angka satuanku adalah ${ones}.`, test: (n) => n % 10 === ones });
  }

  if (secret % 5 === 0 && secret > 0) {
    pool.push({ text: 'Aku habis dibagi 5.', test: (n) => n % 5 === 0 });
  }

  return shuffleArr(pool).slice(0, Math.min(count, pool.length));
}

function countMatches(clues: Clue[], max: number): number[] {
  const out: number[] = [];
  for (let n = 1; n <= max; n++) if (clues.every((c) => c.test(n))) out.push(n);
  return out;
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const max = tier === 1 ? 20 : tier === 2 ? 30 : 50;
  const clueCount = tier === 1 ? 2 : tier === 2 ? 3 : 3;

  let secret = 0;
  let clues: Clue[] = [];
  let matches: number[] = [];
  let guard = 0;

  do {
    guard++;
    secret = randInt(1, max);
    clues = makeClues(secret, max, clueCount);
    matches = countMatches(clues, max);
  } while ((matches.length !== 1 || matches[0] !== secret) && guard < 60);

  // Jaring pengaman: kalau 60x coba tetap belum unik (sangat jarang), pakai petunjuk paling ketat saja.
  if (matches.length !== 1) {
    secret = randInt(1, max);
    const parity: Clue = secret % 2 === 0
      ? { text: 'Aku adalah angka genap.', test: (n) => n % 2 === 0 }
      : { text: 'Aku adalah angka ganjil.', test: (n) => n % 2 === 1 };
    const between: Clue = { text: `Aku tepat angka ${secret}.`, test: (n) => n === secret };
    clues = [parity, between];
    matches = [secret];
  }

  const others = Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== secret);
  const near = others
    .filter((n) => !clues.every((c) => c.test(n)))
    .sort((a, b) => Math.abs(a - secret) - Math.abs(b - secret))
    .slice(0, 8);
  const decoys = shuffleArr(near.length >= 3 ? near.slice(0, 3) : shuffleArr(others).slice(0, 3));

  return {
    prompt: `🕵️ Petunjuk:\n${clues.map((c) => `• ${c.text}`).join('\n')}\nAku angka berapa?`,
    answer: secret,
    options: shuffleArr([secret, ...decoys]),
  };
}

export default function DetektifAngka({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Detektif Angka"
      emoji="🔍"
      themeColor="#ef4444"
      totalRounds={8}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
