// app/components/games/tk/SuperPetualanganAngka.tsx
// 🏰 Petualangan Angka — tambah & kurang bergambar dengan nyawa, combo, bos
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

const ITEMS = ['🍎', '🍓', '🐥', '⭐', '🎈', '🍪'];

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const item = ITEMS[randInt(0, ITEMS.length - 1)];
  const max = tier === 1 ? 5 : tier === 2 ? 10 : 15;
  const subtract = tier >= 2 && Math.random() > 0.5;

  if (subtract) {
    const a = randInt(3, max);
    const b = randInt(1, a - 1);
    return {
      visual: `${item.repeat(Math.min(a, 10))}${a > 10 ? '…' : ''}`,
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      options: numericOptions(a - b, 3),
    };
  }
  const a = randInt(1, Math.max(2, Math.floor(max / 2)));
  const b = randInt(1, Math.max(2, max - a));
  return {
    visual: `${item.repeat(a)} + ${item.repeat(b)}`,
    prompt: `${a} + ${b} = ?`,
    answer: a + b,
    options: numericOptions(a + b, 3),
  };
}

export default function SuperPetualanganAngka({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Petualangan Angka"
      emoji="🏰"
      themeColor="#ec4899"
      totalRounds={9}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
