// app/components/games/kelas1/JamWaktu.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function JamWaktu({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'learn' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ hour: 7, minute: 0, opts: [] as string[] });
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const formatTime = (h: number, m: number) => {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    return `${hour}:${min}`;
  };

  const generate = () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const correctStr = formatTime(hour, minute);
    const wrongs = new Set<string>();
    while (wrongs.size < 3) {
      const wh = Math.floor(Math.random() * 12) + 1;
      const wm = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const ws = formatTime(wh, wm);
      if (ws !== correctStr) wrongs.add(ws);
    }
    setQ({ hour, minute, opts: [...wrongs, correctStr].sort(() => Math.random() - 0.5) });
  };

  const renderClock = (h: number, m: number) => {
    const hourAngle = (h % 12) * 30 + m * 0.5;
    const minAngle = m * 6;
    
    return (
      <svg viewBox="0 0 200 200" style={{ width: '180px', height: '180px', margin: '0 auto' }}>
        <circle cx="100" cy="100" r="90" fill="white" stroke={theme.border} strokeWidth="4"/>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
          const angle = i * 30 * Math.PI / 180;
          const x = 100 + 70 * Math.sin(angle);
          const y = 100 - 70 * Math.cos(angle);
          return <text key={n} x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill={theme.text}>{n}</text>;
        })}
        <line x1="100" y1="100" x2={100 + 45 * Math.sin(hourAngle * Math.PI / 180)} y2={100 - 45 * Math.cos(hourAngle * Math.PI / 180)} stroke="#1e293b" strokeWidth="6" strokeLinecap="round"/>
        <line x1="100" y1="100" x2={100 + 65 * Math.sin(minAngle * Math.PI / 180)} y2={100 - 65 * Math.cos(minAngle * Math.PI / 180)} stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="100" cy="100" r="5" fill="#1e293b"/>
      </svg>
    );
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === formatTime(q.hour, q.minute);
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
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🕐</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Jam & Waktu!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Belajar membaca jam dengan seru! ⏰</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#06b6d4', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6,182,212,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '20px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '16px' }}>Jam berapa ini?</h3>
        {renderClock(q.hour, q.minute)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '22px', fontWeight: '900', borderRadius: '14px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === formatTime(q.hour, q.minute) ? '#10b981' : theme.bgHover,
              color: selected === opt || (selected !== null && opt === formatTime(q.hour, q.minute)) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar!' : `❌ ${formatTime(q.hour, q.minute)}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Ahli Jam!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}