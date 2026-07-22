// app/components/games/tk/UrutAngka.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

export default function UrutAngka({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null, null, null]);
  const [available, setAvailable] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(false);

  const generate = () => {
    const start = Math.floor(Math.random() * 5) + 1; // 1-5
    const nums = [start, start + 1, start + 2, start + 3, start + 4];
    setNumbers(nums);
    setSlots([null, null, null, null, null]);
    setAvailable([...nums].sort(() => Math.random() - 0.5));
  };

  const start = () => { setStep('play'); setScore(0); setTotal(0); generate(); };

  const pickNumber = (num: number) => {
    const emptySlot = slots.findIndex(s => s === null);
    if (emptySlot === -1) return;
    
    const newSlots = [...slots];
    newSlots[emptySlot] = num;
    setSlots(newSlots);
    setAvailable(av => av.filter(n => n !== num));

    // Check if all slots filled
    if (newSlots.every(s => s !== null)) {
      const isCorrect = newSlots.every((s, i) => s === numbers[i]);
      setCorrect(isCorrect);
      setTotal(t => t + 1);
      if (isCorrect) setScore(s => s + 1);
      
      setTimeout(() => {
        if (total < 4) generate();
        else setStep('complete');
      }, 1500);
    }
  };

  const resetSlots = () => {
    setSlots([null, null, null, null, null]);
    setAvailable([...numbers].sort(() => Math.random() - 0.5));
  };

  const stars = score >= 4 ? 3 : score >= 3 ? 2 : 1;
  const handleComplete = () => onComplete(stars, { score, total });

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔢</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '8px' }}>Urut Angka!</h2>
      <p style={{ fontSize: '16px', color: theme.textSecondary, marginBottom: '24px' }}>Susun angka dari yang terkecil ke terbesar! 🎯</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '40px', marginBottom: '24px' }}>
        {['3️⃣','1️⃣','4️⃣','2️⃣','5️⃣'].map((n, i) => <span key={i}>{n}</span>)}
        <span>→</span>
        {['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'].map((n, i) => <span key={i}>{n}</span>)}
      </div>
      <button onClick={start} style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'play') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>Soal {total + 1}/5</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>⭐ {score}</span>
      </div>

      <div style={{ background: theme.bgCard, borderRadius: '24px', padding: '30px', boxShadow: theme.shadow, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', color: theme.heading, marginBottom: '20px' }}>Susun dari yang TERKECIL!</h3>
        
        {/* Target slots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {slots.map((slot, i) => (
            <div key={i} style={{
              width: '55px', height: '65px', borderRadius: '12px', border: `2px dashed ${theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '900',
              background: slot !== null ? (slots.every(s => s !== null) ? (correct ? '#d1fae5' : '#fee2e2') : theme.bgHover) : 'transparent',
              color: slot !== null ? theme.text : theme.textMuted,
              transition: 'all 0.3s',
            }}>
              {slot !== null ? slot : '?'}
            </div>
          ))}
        </div>

        {/* Available numbers */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {available.map((num, i) => (
            <button key={i} onClick={() => pickNumber(num)}
              style={{
                width: '55px', height: '65px', borderRadius: '12px', border: 'none',
                fontSize: '28px', fontWeight: '900',
                background: '#7c3aed', color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              }}
            >{num}</button>
          ))}
        </div>

        <button onClick={resetSlots} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          🔄 Ulang
        </button>
      </div>

      {slots.every(s => s !== null) && (
        <div style={{ padding: '14px', borderRadius: '12px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: '18px', animation: 'pop 0.3s ease-out' }}>
          {correct ? '🎉 Benar! Urutannya tepat!' : `❌ Yang benar: ${numbers.join(' → ')}`}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Kamu Hebat!</h2>
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px' }}>Skor: <strong>{score}/5</strong></p>
        <div style={{ fontSize: '50px' }}>{'⭐'.repeat(stars)}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={start} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '700', cursor: 'pointer' }}>🔄 Main Lagi</button>
        <button onClick={handleComplete} style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    </div>
  );
}