// app/components/games/kelas4/SuperDungeonPecahan.tsx
// 🗝️ Dungeon Pecahan & KPK — pecahan, KPK/FPB, desimal
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const kind = tier === 1 ? 0 : tier === 2 ? randInt(0, 2) : randInt(1, 3);

  if (kind === 0) {
    const d = [2, 3, 4, 5][randInt(0, 3)];
    const n = randInt(2, 8) * d;
    return { prompt: `1/${d} dari ${n} = ?`, answer: n / d, options: numericOptions(n / d, 4) };
  }
  if (kind === 1) {
    const a = [2, 3, 4, 5, 6][randInt(0, 4)];
    const b = [3, 4, 5, 6, 8][randInt(0, 4)];
    const ans = lcm(a, b);
    return { prompt: `KPK dari ${a} dan ${b} = ?`, answer: ans, options: numericOptions(ans, 6) };
  }
  if (kind === 2) {
    const g = randInt(2, 6);
    const a = g * randInt(2, 5);
    let b = g * randInt(2, 5);
    if (a === b) b += g;
    const ans = gcd(a, b);
    return { prompt: `FPB dari ${a} dan ${b} = ?`, answer: ans, options: numericOptions(ans, 3) };
  }
  const a = randInt(11, 99) / 10;
  const b = randInt(11, 99) / 10;
  const ans = Math.round((a + b) * 10) / 10;
  const opts = new Set<number>([ans]);
  while (opts.size < 4) opts.add(Math.round((ans + (randInt(1, 15) / 10) * (Math.random() > 0.5 ? 1 : -1)) * 10) / 10);
  return { prompt: `${a} + ${b} = ?`, answer: ans, options: Array.from(opts).sort(() => Math.random() - 0.5) };
}

export default function SuperDungeonPecahan({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Dungeon Pecahan & KPK"
      emoji="🗝️"
      themeColor="#ef4444"
      totalRounds={12}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
