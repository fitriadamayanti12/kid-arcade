// app/components/games/kelas5/SuperOlimpiadeArena.tsx
// 🏅 Olimpiade Arena — kecepatan, skala, volume, persen, pecahan
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions } from '../shared/PowerBattle';

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const kind = randInt(0, tier === 1 ? 2 : 4);

  if (kind === 0) {
    const v = randInt(2, tier === 1 ? 6 : 12) * 10;
    const t = randInt(2, 5);
    return { prompt: `Mobil ${v} km/jam selama ${t} jam. Jarak = ? km`, answer: v * t, options: numericOptions(v * t, 30) };
  }
  if (kind === 1) {
    const p = [10, 20, 25, 50][randInt(0, 3)];
    const n = randInt(2, 10) * 20;
    return { prompt: `${p}% dari ${n} = ?`, answer: (p * n) / 100, options: numericOptions((p * n) / 100, 8) };
  }
  if (kind === 2) {
    const s = randInt(2, tier === 1 ? 6 : 10);
    return { prompt: `Volume kubus rusuk ${s} cm = ? cm³`, answer: s ** 3, options: numericOptions(s ** 3, 20) };
  }
  if (kind === 3) {
    const scale = [100, 200, 500][randInt(0, 2)];
    const cm = randInt(2, 9);
    return { prompt: `Skala 1:${scale}, di peta ${cm} cm. Asli = ? cm`, answer: scale * cm, options: numericOptions(scale * cm, 3 * scale / 2) };
  }
  const p = randInt(2, 6);
  const q = randInt(2, 6);
  return { prompt: `Volume balok ${p}×${q}×4 cm = ? cm³`, answer: p * q * 4, options: numericOptions(p * q * 4, 12) };
}

export default function SuperOlimpiadeArena({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Olimpiade Arena"
      emoji="🏅"
      themeColor="#f97316"
      totalRounds={12}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
