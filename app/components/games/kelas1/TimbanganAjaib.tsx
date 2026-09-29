// app/components/games/kelas1/TimbanganAjaib.tsx
// ⚖️ Timbangan Ajaib — penalaran perbandingan & kesetaraan (tipe soal olimpiade klasik),
// dari sekadar "mana lebih banyak" sampai "kalau 1 apel = 2 pisang, berapa pisang biar seimbang?"
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

const FRUITS = ['🍎', '🍌', '🍇', '🍊', '🍓'];

function compareQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const emoji = FRUITS[randInt(0, FRUITS.length - 1)];
  const max = tier === 1 ? 6 : 9;
  const allowTie = tier >= 2 && Math.random() < 0.25;
  let left = randInt(1, max);
  let right = allowTie ? left : randInt(1, max);
  while (!allowTie && left === right) right = randInt(1, max);

  const answer = left === right ? 'Sama' : left > right ? 'Kiri' : 'Kanan';
  return {
    prompt: 'Sisi mana yang lebih banyak?',
    visual: `⚖️  Kiri: ${emoji.repeat(left)}\nKanan: ${emoji.repeat(right)}`,
    answer,
    options: shuffleArr(['Kiri', 'Kanan', 'Sama']),
  };
}

function balanceQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const e1 = FRUITS[randInt(0, FRUITS.length - 1)];
  let e2 = FRUITS[randInt(0, FRUITS.length - 1)];
  while (e2 === e1) e2 = FRUITS[randInt(0, FRUITS.length - 1)];

  const ratio = tier === 3 ? randInt(2, 4) : 2; // 1 e1 = `ratio` e2
  const leftCount = randInt(2, tier === 1 ? 3 : 4);
  const answer = leftCount * ratio;

  return {
    prompt: `1 ${e1} sama berat dengan ${ratio} ${e2}.\nSupaya seimbang, ${leftCount} ${e1} = berapa ${e2}?`,
    visual: `⚖️  Kiri: ${e1.repeat(leftCount)}     Kanan: ${e2} × ❓`,
    answer,
    options: shuffleArr(numericOptions(answer, ratio, 4)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  if (tier === 1) return compareQuestion(tier);
  return Math.random() < 0.5 ? compareQuestion(tier) : balanceQuestion(tier);
}

export default function TimbanganAjaib({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Timbangan Ajaib"
      emoji="⚖️"
      themeColor="#f59e0b"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
