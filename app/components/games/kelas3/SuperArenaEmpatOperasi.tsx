// app/components/games/kelas3/SuperArenaEmpatOperasi.tsx
// 🥊 Arena Master 4 Operasi — + − × ÷ campur, makin sulit tiap ronde
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const op = randInt(0, 3);
  if (op === 0) {
    const max = tier === 1 ? 100 : tier === 2 ? 500 : 999;
    const a = randInt(20, max);
    const b = randInt(10, max);
    return { prompt: `${a} + ${b} = ?`, answer: a + b, options: numericOptions(a + b, 20) };
  }
  if (op === 1) {
    const max = tier === 1 ? 100 : tier === 2 ? 500 : 999;
    const a = randInt(50, max);
    const b = randInt(10, a - 1);
    return { prompt: `${a} − ${b} = ?`, answer: a - b, options: numericOptions(a - b, 20) };
  }
  if (op === 2) {
    const a = tier === 1 ? randInt(2, 9) : randInt(11, tier === 2 ? 30 : 99);
    const b = randInt(2, 9);
    return { prompt: `${a} × ${b} = ?`, answer: a * b, options: numericOptions(a * b, 10) };
  }
  const b = randInt(2, 9);
  const q = tier === 1 ? randInt(2, 9) : randInt(6, tier === 2 ? 20 : 50);
  return { prompt: `${b * q} ÷ ${b} = ?`, answer: q, options: numericOptions(q, 4) };
}

export default function SuperArenaEmpatOperasi({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Arena Master 4 Operasi"
      emoji="🥊"
      themeColor="#8b5cf6"
      totalRounds={12}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
