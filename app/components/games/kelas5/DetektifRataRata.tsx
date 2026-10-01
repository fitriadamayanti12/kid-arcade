// app/components/games/kelas5/DetektifRataRata.tsx
// 📊 Detektif Rata-Rata — hitung rata-rata (mean) dari sekumpulan data, dibungkus soal cerita
'use client';

import PowerBattle, { PowerQuestion, randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

const NAMES = ['Budi', 'Sari', 'Andi', 'Dina', 'Rina', 'Joko', 'Tono', 'Lina'];
const SUBJECTS = ['ulangan Matematika', 'ulangan IPA', 'lomba lari (detik)', 'tinggi tanaman (cm)'];

/**
 * Bikin `count` angka yang jumlahnya PASTI pas `avg * count` (tanpa fallback curang).
 * Dengan spread=1, angka terakhir minimal = avg - (count-1), dan karena avg selalu
 * dipilih >= count (lihat avgQuestion), angka terakhir dijamin >= 1 — tidak pernah negatif.
 */
function makeDataset(avg: number, count: number): number[] {
  const nums: number[] = [];
  let sumSoFar = 0;
  for (let i = 0; i < count - 1; i++) {
    const v = avg + randInt(-1, 1);
    nums.push(v);
    sumSoFar += v;
  }
  nums.push(avg * count - sumSoFar);
  return shuffleArr(nums);
}

function avgQuestion(tier: 1 | 2 | 3): PowerQuestion {
  const count = tier === 1 ? 3 : tier === 2 ? 4 : 5;
  const avg = randInt(count + 3, count + 7); // jauh di atas `count` → angka terakhir dijamin positif
  const data = makeDataset(avg, count);
  const name = NAMES[randInt(0, NAMES.length - 1)];
  const subject = SUBJECTS[randInt(0, SUBJECTS.length - 1)];
  return {
    prompt: `Nilai ${subject} milik ${name}: ${data.join(', ')}.\nRata-ratanya = ?`,
    answer: avg,
    options: shuffleArr(numericOptions(avg, 2, 4)),
  };
}

function generateQuestion(_round: number, tier: 1 | 2 | 3): PowerQuestion {
  return avgQuestion(tier);
}

export default function DetektifRataRata({ onComplete }: { onComplete: (stars: number, extra?: any) => void }) {
  return (
    <PowerBattle
      title="Detektif Rata-Rata"
      emoji="📊"
      themeColor="#8b5cf6"
      totalRounds={10}
      generateQuestion={generateQuestion}
      onComplete={onComplete}
    />
  );
}
