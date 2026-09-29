// app/components/games/kelas6/SuperKejuaraanMatematika.tsx
// 🏆 Kejuaraan Matematika — aljabar, rasio, lingkaran, bilangan bulat, rata-rata
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const kind = randInt(0, tier === 1 ? 2 : 5);

  if (kind === 0) {
    const x = randInt(2, 12);
    const a = randInt(2, tier === 1 ? 4 : 9);
    const b = randInt(1, 15);
    return { prompt: `${a}x + ${b} = ${a * x + b}. x = ?`, answer: x, options: numericOptions(x, 3) };
  }
  if (kind === 1) {
    const a = randInt(2, 6);
    const b = randInt(2, 6);
    const k = randInt(2, 6);
    return { prompt: `Rasio ${a}:${b}, yang pertama ${a * k}. Yang kedua = ?`, answer: b * k, options: numericOptions(b * k, 6) };
  }
  if (kind === 2) {
    const a = randInt(-12, 12);
    const b = randInt(-12, 12);
    return { prompt: `(${a}) + (${b}) = ?`, answer: a + b, options: numericOptions(a + b + 30, 6).map((n) => n - 30) };
  }
  if (kind === 3) {
    const r = [7, 14, 21][randInt(0, 2)];
    return { prompt: `Keliling lingkaran r = ${r} cm (π = 22/7)`, answer: 2 * 22 * (r / 7), options: numericOptions(2 * 22 * (r / 7), 12) };
  }
  if (kind === 4) {
    const n = randInt(3, 5);
    const avg = randInt(6, 9);
    const nums = Array.from({ length: n - 1 }, () => randInt(4, 10));
    const last = avg * n - nums.reduce((s, v) => s + v, 0);
    if (last > 0) {
      return { prompt: `Data: ${[...nums, last].join(', ')}. Rata-rata = ?`, answer: avg, options: numericOptions(avg, 3) };
    }
  }
  const s = randInt(3, 12);
  return { prompt: `Luas persegi sisi ${s} cm = ? cm²`, answer: s * s, options: numericOptions(s * s, 10) };
}

export default function SuperKejuaraanMatematika({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Kejuaraan Matematika"
      emoji="🏆"
      themeColor="#06b6d4"
      totalRounds={15}
      lives={4}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
