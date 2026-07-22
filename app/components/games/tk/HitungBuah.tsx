// app/components/games/tk/HitungBuah.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const FRUITS = [
  { emoji: '🍎', name: 'Apel' },
  { emoji: '🍊', name: 'Jeruk' },
  { emoji: '🍋', name: 'Lemon' },
  { emoji: '🍇', name: 'Anggur' },
  { emoji: '🍓', name: 'Stroberi' },
  { emoji: '🍌', name: 'Pisang' },
  { emoji: '🍑', name: 'Persik' },
  { emoji: '🥝', name: 'Kiwi' },
];

export default function HitungBuah({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ count: 0, fruit: FRUITS[0], opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const count = Math.floor(Math.random() * 8) + 2; // 2-9
    const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = count + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (w !== count && w > 0 && w <= 12) wrongs.add(w);
    }
    setQ({ count, fruit, opts: [...wrongs, count].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.count;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (total < 9) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1200);
  };

  const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🍎</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Hitung Buah!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Hitung ada berapa buah di keranjang! 🧺</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '40px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FRUITS.map((f, i) => <span key={i} title={f.name} style={{ animation: `float ${1.5 + i * 0.2}s ease-in-out infinite` }}>{f.emoji}</span>)}
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${((total) / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        {/* Keranjang dengan buah */}
        <div style={{ 
          background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)', 
          borderRadius: '20px', 
          padding: '20px',
          marginBottom: '16px',
          border: '3px solid #f59e0b',
          minHeight: '120px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}>
          {Array.from({ length: q.count }).map((_, i) => (
            <span key={i} style={{ 
              fontSize: '40px',
              animation: `pop 0.3s ease-out ${i * 0.05}s both`,
            }}>{q.fruit.emoji}</span>
          ))}
        </div>
        
        <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '8px' }}>
          Ada berapa {q.fruit.name} di keranjang?
        </p>
        <h3 style={{ fontSize: '24px', fontWeight: '900', color: theme.heading }}>
          Hitung semua {q.fruit.emoji}!
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '28px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.count ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === q.count) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
              transform: selected === opt ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! Ada ${q.count} ${q.fruit.name}` : `❌ Ada ${q.count} ${q.fruit.name}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Keren!</h2>
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