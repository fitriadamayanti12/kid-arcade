// app/components/games/kelas1/PolaLogika.tsx
// 🧩 Pola & Logika — melatih pengenalan pola (angka & bentuk), dasar penalaran ala olimpiade,
// dikemas di mesin PowerBattle (nyawa, combo, ronde bos) biar tetap seru dimainkan.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣'];

function numSeqQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const desc = tier === 3 && Math.random() > 0.5; // menurun, hanya di tier sulit
  const maxStep = tier === 1 ? 2 : tier === 2 ? 5 : 8;
  const step = randInt(1, maxStep);
  const start = desc ? randInt(step * 4 + 1, step * 4 + 15) : randInt(1, 10);
  const terms: number[] = [];
  for (let i = 0; i < 4; i++) terms.push(desc ? start - i * step : start + i * step);
  const answer = desc ? start - 4 * step : start + 4 * step;
  return {
    prompt: `${terms.join(', ')}, ?`,
    answer,
    options: shuffleArr(numericOptions(answer, Math.max(2, step), 4)),
  };
}

function shapeRepeatQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const period = tier === 1 ? 2 : 3;
  const pattern = shuffleArr(SHAPES).slice(0, period);
  const showCount = period === 2 ? 5 : 6; // tampilkan pola, tanya elemen berikutnya
  const shown: string[] = [];
  for (let i = 0; i < showCount; i++) shown.push(pattern[i % period]);
  const answer = pattern[showCount % period];
  const decoyPool = SHAPES.filter((s) => s !== answer);
  const wrongs = shuffleArr(decoyPool).slice(0, 3);
  return {
    prompt: 'Apa bentuk selanjutnya?',
    visual: shown.join(' ') + ' ❓',
    answer,
    options: shuffleArr([answer, ...wrongs]),
  };
}

function growingQuestion(): PowerQuestion {
  const emoji = SHAPES[randInt(0, SHAPES.length - 1)];
  const a = randInt(1, 2);
  const d = randInt(1, 2);
  const rows = [a, a + d, a + 2 * d];
  const answer = a + 3 * d;
  const visual = rows.map((r) => emoji.repeat(r)).join('  |  ');
  return {
    prompt: 'Kalau polanya terus bertambah, baris ke-4 ada berapa gambar?',
    visual: `${visual}  |  ?`,
    answer,
    options: shuffleArr(numericOptions(answer, Math.max(2, d + 1), 4)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const roll = Math.random();
  if (tier === 1) {
    return roll < 0.55 ? numSeqQuestion(tier) : shapeRepeatQuestion(tier);
  }
  if (roll < 0.45) return numSeqQuestion(tier);
  if (roll < 0.8) return shapeRepeatQuestion(tier);
  return growingQuestion();
}

export default function PolaLogika({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Pola & Logika"
      emoji="🧩"
      themeColor="#10b981"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
