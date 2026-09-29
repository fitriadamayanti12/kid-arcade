// app/components/games/kelas2/SuperKerajaanKali.tsx
// 👑 Kerajaan Perkalian — kali & bagi dengan nyawa, combo, ronde bos
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const maxF = tier === 1 ? 5 : 9;
  const a = randInt(2, maxF);
  const b = randInt(2, tier === 3 ? 10 : maxF);
  if (tier >= 2 && Math.random() > 0.5) {
    return { prompt: `${a * b} ÷ ${a} = ?`, answer: b, options: numericOptions(b, 3) };
  }
  return { prompt: `${a} × ${b} = ?`, answer: a * b, options: numericOptions(a * b, tier === 1 ? 4 : 8) };
}

export default function SuperKerajaanKali({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Kerajaan Perkalian"
      emoji="👑"
      themeColor="#3b82f6"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
