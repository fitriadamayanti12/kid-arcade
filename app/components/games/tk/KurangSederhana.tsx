// app/components/games/tk/KurangSederhana.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const ANIMALS = ['🐤', '🐰', '🐸', '🐶', '🐱'];

export default function KurangSederhana({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ total: 0, kurang: 0, animal: '🐤', opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const generate = () => {
    const total = Math.floor(Math.random() * 5) + 4; // 4-8
    const kurang = Math.floor(Math.random() * (total - 1)) + 1; // 1 to total-1
    const ans = total - kurang;
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (w !== ans && w >= 0 && w <= 8) wrongs.add(w);
    }
    setQ({ total, kurang, animal, opts: [...wrongs, ans].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); setStreak(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.total - q.kurang;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else setStreak(0);
    setTimeout(() => {
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>➖</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Kurang Seru!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar pengurangan dengan hewan lucu! 🐤</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '40px', marginBottom: '24px' }}>
        <span>🐤🐤🐤🐤🐤</span>
        <span style={{ fontSize: '30px', alignSelf: 'center' }}>➖</span>
        <span>🐤🐤</span>
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
        {streak >= 3 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>🔥 {streak}x</span>}
      </div>

      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${((total) / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <div style={{ fontSize: '45px', letterSpacing: '6px', marginBottom: '16px', lineHeight: 1.6 }}>
          {Array.from({ length: q.total }).map((_, i) => (
            <span key={i} style={{ 
              opacity: i >= q.total - q.kurang ? 0.3 : 1,
              textDecoration: i >= q.total - q.kurang ? 'line-through' : 'none',
              transition: 'all 0.5s',
            }}>{q.animal}</span>
          ))}
        </div>
        <p style={{ fontSize: '16px', color: theme.textMuted, marginBottom: '12px' }}>
          {q.kurang} ekor pergi, tinggal berapa?
        </p>
        <h3 style={{ fontSize: '32px', fontWeight: '900', color: theme.heading }}>
          {q.total} - {q.kurang} = ?
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.total - q.kurang ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.total - q.kurang) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! ${q.total}-${q.kurang}=${q.total - q.kurang}` : `❌ ${q.total}-${q.kurang}=${q.total - q.kurang}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Keren Banget!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={start} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>🔄 Coba Lagi</button>
        <button onClick={handleComplete} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    </div>
  );
}