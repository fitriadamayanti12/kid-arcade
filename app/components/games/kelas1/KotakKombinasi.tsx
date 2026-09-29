// app/components/games/kelas1/KotakKombinasi.tsx
// 📦 Kotak Kombinasi — dasar berpikir kombinatorik ("berapa banyak pasangan yang mungkin?"),
// tipe soal yang sering muncul di olimpiade SD kelas awal, dibuat visual & sederhana.
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

const TOPS = ['👕', '👚', '🧥'];
const BOTTOMS = ['👖', '🩳'];

function pairsQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const nTop = tier === 1 ? randInt(2, 3) : randInt(2, 4);
  const nBottom = tier === 1 ? 2 : randInt(2, 3);
  const answer = nTop * nBottom;
  return {
    prompt: `Ada ${nTop} atasan dan ${nBottom} bawahan. Ada berapa pasang kombinasi yang bisa dipakai?`,
    visual: `${TOPS.join(' ')}   ×   ${BOTTOMS.join(' ')}`,
    answer,
    options: shuffleArr(numericOptions(answer, Math.max(2, nBottom), 4)),
  };
}

function threeWayQuestion(): PowerQuestion {
  const a = randInt(2, 3);
  const b = randInt(2, 3);
  const c = 2;
  const answer = a * b * c;
  return {
    prompt: `Ada ${a} topi, ${b} baju, dan ${c} sepatu. Ada berapa gaya lengkap yang bisa dibuat?`,
    visual: `🎩 × ${a}   👕 × ${b}   👟 × ${c}`,
    answer,
    options: shuffleArr(numericOptions(answer, 4, 4)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  if (tier === 3 && Math.random() < 0.4) return threeWayQuestion();
  return pairsQuestion(tier);
}

export default function KotakKombinasi({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Kotak Kombinasi"
      emoji="📦"
      themeColor="#8b5cf6"
      totalRounds={9}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
