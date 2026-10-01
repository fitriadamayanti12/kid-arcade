// app/components/games/kelas2/PasarUang.tsx
// 🛍️ Pasar Uang — jumlah harga, dan kembalian uang belanja (angka rupiah bulat, level Kelas 2)
'use client';

import PowerBattle, { PowerQuestion, randInt, shuffleArr, numericOptions } from '../shared/PowerBattle';

const ITEMS = ['🍬 Permen', '🍞 Roti', '✏️ Pensil', '📒 Buku', '🧃 Jus', '🍪 Biskuit'];
const UNITS = [100, 200, 500, 1000, 2000];

function rp(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

function sumQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const unit = UNITS[randInt(0, tier === 1 ? 2 : UNITS.length - 1)];
  const a = unit * randInt(1, tier === 1 ? 5 : 9);
  const b = unit * randInt(1, tier === 1 ? 5 : 9);
  const [i1, i2] = shuffleArr(ITEMS).slice(0, 2);
  const answer = a + b;
  return {
    prompt: `${i1} harganya ${rp(a)}. ${i2} harganya ${rp(b)}. Total belanja = ?`,
    answer: rp(answer),
    options: shuffleArr(numericOptions(answer, unit, 4)).map(rp),
  };
}

function changeQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const unit = UNITS[randInt(1, tier === 1 ? 3 : UNITS.length - 1)];
  const pay = unit * randInt(5, 10);
  const price = unit * randInt(1, 4);
  const answer = pay - price;
  const item = ITEMS[randInt(0, ITEMS.length - 1)];
  return {
    prompt: `${item} harganya ${rp(price)}. Dibayar dengan ${rp(pay)}. Kembaliannya = ?`,
    answer: rp(answer),
    options: shuffleArr(numericOptions(answer, unit, 4)).map(rp),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return tier >= 2 && Math.random() < 0.5 ? changeQuestion(tier) : sumQuestion(tier);
}

export default function PasarUang({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Pasar Uang"
      emoji="🛍️"
      themeColor="#22c55e"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
