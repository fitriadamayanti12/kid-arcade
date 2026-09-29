// app/components/games/kelas3/PerkalianKilat.tsx
// ⚡ Perkalian Kilat — kuasai tabel 2–10 dengan trik + peta penguasaan
'use client';

import MasteryPractice from '../shared/MasteryPractice';
import { kelas3Config } from '@/lib/mastery/kelas3';

export default function PerkalianKilat({ onComplete, playerName }: { onComplete: (stars: number, extra?: any) => void; playerName?: string }) {
  return <MasteryPractice config={kelas3Config} playerName={playerName} onComplete={onComplete} />;
}
