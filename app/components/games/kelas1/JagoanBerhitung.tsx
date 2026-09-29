// app/components/games/kelas1/JagoanBerhitung.tsx
// 🚀 Jagoan Berhitung — jalur catch-up berhitung Kelas 1 (menghitung → pasangan 10 → tambah/kurang → cerita)
'use client';

import MasteryPractice from '../shared/MasteryPractice';
import { kelas1Config } from '@/lib/mastery/kelas1';

export default function JagoanBerhitung({ onComplete, playerName }: { onComplete: (stars: number, extra?: any) => void; playerName?: string }) {
  return <MasteryPractice config={kelas1Config} playerName={playerName} onComplete={onComplete} />;
}
