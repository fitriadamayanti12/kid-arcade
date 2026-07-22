// app/components/games/kelas1/UangSaku.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const COINS = [
  { value: 100, label: 'Rp 100', emoji: '🪙' },
  { value: 200, label: 'Rp 200', emoji: '🪙' },
  { value: 500, label: 'Rp 500', emoji: '🪙' },
  { value: 1000, label: 'Rp 1.000', emoji: '💵' },
];

export default function UangSaku({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ coins: [] as number[], total: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const numCoins = Math.floor(Math.random() * 3) + 2; // 2-4 coins
    const coins: number[] = [];
    let sum = 0;
    for (let i = 0; i < numCoins; i++) {
      const coin = COINS[Math.floor(Math.random() * COINS.length)];
      coins.push(coin.value);
      sum += coin.value;
    }
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = sum + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 500) + 100);
      if (w !== sum && w > 0) wrongs.add(w);
    }
    setQ({ coins, total: sum, opts: [...wrongs, sum].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.total;
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
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>💵</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Uang Saku!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar menghitung uang dengan seru! 🪙</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '16px' }}>Berapa total uangnya?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {q.coins.map((coin, i) => {
            const coinData = COINS.find(c => c.value === coin);
            return (
              <div key={i} style={{ background: '#fef3c7', borderRadius: '12px', padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '30px' }}>{coinData?.emoji}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>{coinData?.label}</div>
              </div>
            );
          })}
        </div>
        <h3 style={{ fontSize: '28px', fontWeight: '900', color: theme.heading }}>Total = ?</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '18px', fontWeight: '700', borderRadius: '12px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.total ? '#10b981' : theme.bgHover,
              color: (selected === opt || (selected !== null && opt === q.total)) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >Rp {opt.toLocaleString()}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ Total: Rp ${q.total.toLocaleString()}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Jago Uang!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}