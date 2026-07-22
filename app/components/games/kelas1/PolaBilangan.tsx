// app/components/games/kelas1/PolaBilangan.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function PolaBilangan({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState({ sequence: [] as number[], answer: 0, missingIdx: 0, opts: [] as number[] });
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const generate = () => {
    const patterns = [
      { start: 1, step: 2, length: 5 },  // 1,3,5,7,9
      { start: 2, step: 2, length: 5 },  // 2,4,6,8,10
      { start: 5, step: 5, length: 5 },  // 5,10,15,20,25
      { start: 10, step: 10, length: 5 }, // 10,20,30,40,50
      { start: 1, step: 1, length: 5 },  // 1,2,3,4,5
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const sequence = Array.from({ length: pattern.length }, (_, i) => pattern.start + i * pattern.step);
    const missingIdx = Math.floor(Math.random() * (sequence.length - 2)) + 1; // bukan pertama/terakhir
    const answer = sequence[missingIdx];
    sequence[missingIdx] = -1; // placeholder
    
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = answer + (Math.random() > 0.5 ? 1 : -1) * pattern.step;
      if (w !== answer && w > 0 && !sequence.includes(w)) wrongs.add(w);
    }
    setQ({ sequence, answer, missingIdx, opts: [...wrongs, answer].sort(() => Math.random() - 0.5) });
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const handle = (ans: number) => {
    if (selected !== null) return;
    setSelected(ans);
    const ok = ans === q.answer;
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
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔢</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading }}>Pola Bilangan!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Temukan angka yang hilang dalam pola! 🧩</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '30px', marginBottom: '24px' }}>
        {[2, 4, 6, '❓', 10].map((n, i) => (
          <span key={i} style={{ background: n === '❓' ? '#fef3c7' : '#eff6ff', borderRadius: '12px', padding: '12px 16px', fontWeight: '900', color: n === '❓' ? '#f59e0b' : '#3b82f6' }}>{n}</span>
        ))}
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/10</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: theme.heading, marginBottom: '20px' }}>Angka berapa yang hilang?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {q.sequence.map((num, i) => (
            <div key={i} style={{
              width: '60px', height: '60px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: '900',
              background: num === -1 ? '#fef3c7' : '#eff6ff',
              color: num === -1 ? '#f59e0b' : '#3b82f6',
              border: num === -1 ? '3px dashed #f59e0b' : 'none',
              animation: num === -1 ? 'pulse 1s ease-in-out infinite' : 'none',
            }}>
              {num === -1 ? '?' : num}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={selected !== null}
            style={{
              padding: '16px', fontSize: '24px', fontWeight: '900', borderRadius: '16px', border: 'none',
              background: selected === opt ? (correct ? '#10b981' : '#ef4444') : selected !== null && opt === q.answer ? '#10b981' : theme.bgHover,
              color: (selected === opt || (selected !== null && opt === q.answer)) ? '#fff' : theme.text,
              cursor: selected !== null ? 'default' : 'pointer',
            }}
          >{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? `🎉 Benar! ${q.answer}` : `❌ Jawaban: ${q.answer}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Master Pola!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/10</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <button onClick={handleComplete} style={{ padding: '14px 32px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
    </div>
  );
}