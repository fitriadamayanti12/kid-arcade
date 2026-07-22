// app/components/games/kelas4/Sudut.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function Sudut({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ angle: 0, type: '', opts: [] as string[] });
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const angleTypes = [
    { min: 1, max: 89, type: 'Lancip', emoji: '📐' },
    { min: 90, max: 90, type: 'Siku-siku', emoji: '📏' },
    { min: 91, max: 179, type: 'Tumpul', emoji: '📐' },
    { min: 180, max: 180, type: 'Lurus', emoji: '➖' },
  ];

  const generate = () => {
    const at = angleTypes[Math.floor(Math.random() * angleTypes.length)];
    const angle = at.min === at.max ? at.min : Math.floor(Math.random() * (at.max - at.min + 1)) + at.min;
    const correctType = at.type;
    const wrongs = angleTypes.filter(a => a.type !== correctType).map(a => a.type).slice(0, 3);
    setQ({ angle, type: correctType, opts: [...wrongs, correctType].sort(() => Math.random() - 0.5) });
  };

  const renderAngle = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = 100 + 60 * Math.cos(rad);
    const y = 100 - 60 * Math.sin(rad);
    const largeArc = angle > 180 ? 1 : 0;
    
    return (
      <svg viewBox="0 0 200 150" style={{ width: '180px', height: '130px', margin: '0 auto' }}>
        <line x1="100" y1="120" x2="100" y2="60" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="100" y1="120" x2={x} y2={y} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
        <path d={`M 85 105 A 20 20 0 ${largeArc} 1 ${100 + 20 * Math.cos(rad / 2)} ${120 - 20 * Math.sin(rad / 2)}`} fill="none" stroke="#ef4444" strokeWidth="2"/>
        <text x={100 + 30 * Math.cos(rad / 2)} y={120 - 30 * Math.sin(rad / 2)} textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme.text}>{angle}°</text>
      </svg>
    );
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.type;
    setCorrect(ok);
    setTotal(t => t + 1);
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (total < 14) { generate(); setSelected(null); }
      else setStep('complete');
    }, 1000);
  };

  const stars = score >= 12 ? 3 : score >= 9 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>📐</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Sudut!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Kenali jenis sudut: Lancip, Siku-siku, Tumpul! 📏</p>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/15</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '12px' }}>Sudut apa ini?</h3>
        {renderAngle(q.angle)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '14px', fontSize: '18px', fontWeight: '700', borderRadius: '14px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.type ? '#10b981' : theme.bgHover,
              color: (selected === opt || (selected !== null && opt === q.type)) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 ${q.type} (${q.angle}°)` : `❌ ${q.type} (${q.angle}°)`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Ahli Sudut!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/15</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}