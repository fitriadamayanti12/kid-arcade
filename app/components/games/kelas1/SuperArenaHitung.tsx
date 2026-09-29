// app/components/games/kelas1/SuperArenaHitung.tsx
// ⚔️ Arena Hitung Super — tambah/kurang sampai 100 dengan nyawa, combo, bos
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const max = tier === 1 ? 20 : tier === 2 ? 50 : 100;
  if (Math.random() > 0.5) {
    const a = randInt(2, max - 1);
    const b = randInt(1, max - a);
    return { prompt: `${a} + ${b} = ?`, answer: a + b, options: numericOptions(a + b, tier === 1 ? 3 : 10) };
  }
  const a = randInt(5, max);
  const b = randInt(1, a - 1);
  return { prompt: `${a} − ${b} = ?`, answer: a - b, options: numericOptions(a - b, tier === 1 ? 3 : 10) };
}

export default function SuperArenaHitung({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Arena Hitung Super"
      emoji="⚔️"
      themeColor="#10b981"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
