// app/components/games/kelas4/ArenaPembulatan.tsx
// 🔢 Arena Pembulatan — membulatkan bilangan ke puluhan, ratusan, dan ribuan terdekat
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

function roundQuestion(unit: 10 | 100 | 1000): PowerQuestion {
  let n: number;
  if (unit === 10) n = randInt(11, 98);
  else if (unit === 100) n = randInt(101, 989);
  else n = randInt(1001, 9899);

  const answer = Math.round(n / unit) * unit;
  const unitLabel = unit === 10 ? 'puluhan' : unit === 100 ? 'ratusan' : 'ribuan';

  // Bangun 4 pilihan berupa kelipatan `unit` yang unik, melebar dari jawaban
  // ke bawah & atas — supaya tetap ada 4 pilihan walau n kebetulan sudah
  // pas kelipatan `unit` (mis. 50 dibulatkan ke puluhan = 50 juga).
  const candidates = new Set<number>([answer]);
  for (let offset = 1; candidates.size < 4; offset++) {
    const below = answer - offset * unit;
    if (below >= 0) candidates.add(below);
    if (candidates.size < 4) candidates.add(answer + offset * unit);
  }

  return {
    prompt: `Bulatkan ${n} ke ${unitLabel} terdekat!`,
    answer,
    options: shuffleArr(Array.from(candidates)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  const unit = tier === 1 ? 10 : tier === 2 ? 100 : 1000;
  return roundQuestion(unit);
}

export default function ArenaPembulatan({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Arena Pembulatan"
      emoji="🔢"
      themeColor="#f97316"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
