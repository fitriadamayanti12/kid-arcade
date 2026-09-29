// app/components/games/kelas6/MasterMateri6.tsx
// 🎓 Master Materi 6 — FPB, KPK, Pecahan, Bangun Ruang
'use client';

import MasteryPractice from '../shared/MasteryPractice';
import { kelas6Config } from '@/lib/mastery/kelas6';

export default function MasterMateri6({ onComplete, playerName }: { onComplete: (stars: number, extra?: any) => void; playerName?: string }) {
  return <MasteryPractice config={kelas6Config} playerName={playerName} onComplete={onComplete} />;
}
