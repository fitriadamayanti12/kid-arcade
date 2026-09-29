// app/components/games/paud/SuperKebunAngka.tsx
// 🌻 Kebun Angka Ajaib — hitung buah/hewan, 3 nyawa, combo, ronde bos
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr } from '../shared/PowerBattle';

const ITEMS = ['🍎', '🍌', '🐥', '🐟', '⭐', '🌸', '🚗', '🎈', '🍓', '🦋'];

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const max = tier === 1 ? 5 : tier === 2 ? 8 : 10;
  const count = randInt(1, max);
  const item = ITEMS[randInt(0, ITEMS.length - 1)];
  const pool: number[] = [];
  for (let n = 1; n <= Math.max(max, 4); n++) if (n !== count) pool.push(n);
  const wrongs = shuffleArr(pool).slice(0, 3);
  return {
    visual: item.repeat(count),
    prompt: 'Ada berapa?',
    answer: count,
    options: shuffleArr([count, ...wrongs]),
  };
}

export default function SuperKebunAngka({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Kebun Angka Ajaib"
      emoji="🌻"
      themeColor="#f59e0b"
      totalRounds={8}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
