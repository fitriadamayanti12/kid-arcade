// app/components/games/kelas4/ArenaKelilingLuas.tsx
// 📐 Arena Keliling & Luas — persegi & persegi panjang: hitung luas/keliling, atau cari sisi yang hilang
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

function squareQuestion(askArea: boolean): PowerQuestion {
  const s = randInt(2, 9);
  const answer = askArea ? s * s : 4 * s;
  return {
    prompt: askArea ? `Persegi bersisi ${s} cm. Luasnya = ? cm²` : `Persegi bersisi ${s} cm. Kelilingnya = ? cm`,
    answer,
    options: shuffleArr(numericOptions(answer, askArea ? 8 : 6, 4)),
  };
}

function rectQuestion(askArea: boolean): PowerQuestion {
  const p = randInt(3, 12);
  let l = randInt(2, 10);
  while (l === p) l = randInt(2, 10);
  const answer = askArea ? p * l : 2 * (p + l);
  return {
    prompt: askArea
      ? `Persegi panjang ${p} cm × ${l} cm. Luasnya = ? cm²`
      : `Persegi panjang ${p} cm × ${l} cm. Kelilingnya = ? cm`,
    answer,
    options: shuffleArr(numericOptions(answer, askArea ? 12 : 8, 4)),
  };
}

function missingSideQuestion(): PowerQuestion {
  const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81];
  if (Math.random() > 0.5) {
    const area = perfectSquares[randInt(0, perfectSquares.length - 1)];
    const side = Math.sqrt(area);
    return {
      prompt: `Luas persegi ${area} cm². Panjang sisinya = ? cm`,
      answer: side,
      options: shuffleArr(numericOptions(side, 3, 4)),
    };
  }
  const l = randInt(3, 10);
  const p = randInt(l + 1, 14);
  const keliling = 2 * (p + l);
  return {
    prompt: `Keliling persegi panjang ${keliling} cm, panjangnya ${p} cm. Lebarnya = ? cm`,
    answer: l,
    options: shuffleArr(numericOptions(l, 3, 4)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const askArea = Math.random() > 0.5;
  if (tier === 1) return squareQuestion(askArea);
  if (tier === 2) return rectQuestion(askArea);
  return Math.random() < 0.5 ? missingSideQuestion() : rectQuestion(askArea);
}

export default function ArenaKelilingLuas({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Arena Keliling & Luas"
      emoji="📐"
      themeColor="#3b82f6"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
