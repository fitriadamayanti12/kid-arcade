// app/components/games/kelas2/JamBerdetak.tsx
// 🕐 Jam Berdetak — membaca jam (jam penuh & setengah) dan menghitung waktu maju sederhana
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr } from '../shared/PowerBattle';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function uniqueOptions(correct: string, pool: string[], count = 4): string[] {
  const set = new Set<string>([correct]);
  shuffleArr(pool).forEach((p) => set.add(p));
  return shuffleArr(Array.from(set).slice(0, count));
}

function readClockQuestion(useHalf: boolean): PowerQuestion {
  const h = randInt(1, 12);
  if (useHalf) {
    const next = h === 12 ? 1 : h + 1;
    const correct = `Setengah ${next}`;
    const pool = [`Jam ${h}`, `Jam ${next}`, `Setengah ${h === 1 ? 12 : h}`, `Setengah ${next === 12 ? 1 : next + 1}`];
    return {
      prompt: `Pukul ${pad(h)}:30 dibaca …`,
      answer: correct,
      options: uniqueOptions(correct, pool),
    };
  }
  const correct = `Jam ${h}`;
  const pool = [1, 2, 3].map((d) => {
    let n = h + (Math.random() > 0.5 ? d : -d);
    if (n < 1) n += 12;
    if (n > 12) n -= 12;
    return `Jam ${n}`;
  });
  return {
    prompt: `Pukul ${pad(h)}:00 dibaca …`,
    answer: correct,
    options: uniqueOptions(correct, pool),
  };
}

function elapsedQuestion(): PowerQuestion {
  const h = randInt(1, 12);
  const add = randInt(1, 4);
  let answer = h + add;
  while (answer > 12) answer -= 12;
  const correct = `Jam ${answer}`;
  const pool = [1, 2, 3].map((d) => {
    let n = answer + (Math.random() > 0.5 ? d : -d);
    if (n < 1) n += 12;
    if (n > 12) n -= 12;
    return `Jam ${n}`;
  });
  return {
    prompt: `Sekarang jam ${h}. ${add} jam lagi, jam berapa?`,
    answer: correct,
    options: uniqueOptions(correct, pool),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  if (tier === 3 && Math.random() < 0.4) return elapsedQuestion();
  const useHalf = tier >= 2 && Math.random() < 0.5;
  return readClockQuestion(useHalf);
}

export default function JamBerdetak({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Jam Berdetak"
      emoji="🕐"
      themeColor="#06b6d4"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
