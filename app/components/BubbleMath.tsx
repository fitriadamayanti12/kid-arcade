// app/components/BubbleMath.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Bubble {
  id: number;
  number: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface BubbleMathProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void; // ← FIX
}

export default function BubbleMath({ playerName, onComplete }: BubbleMathProps) {
  const theme = useThemeStyles();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState({ text: '', answer: 0 });
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const { playSound } = useSoundEffect();

  const generateQuestion = () => {
    const types = [
      () => { const a = Math.floor(Math.random() * 15) + 1; const b = Math.floor(Math.random() * 10) + 1; return { text: `${a} + ${b} = ?`, answer: a + b }; },
      () => { const a = Math.floor(Math.random() * 12) + 5; const b = Math.floor(Math.random() * a) + 1; return { text: `${a} - ${b} = ?`, answer: a - b }; },
      () => { const a = Math.floor(Math.random() * 6) + 2; const b = Math.floor(Math.random() * 6) + 2; return { text: `${a} × ${b} = ?`, answer: a * b }; },
    ];
    const gen = types[Math.floor(Math.random() * types.length)]();
    setQ(gen);
    return gen.answer;
  };

  const generateBubbles = (answer: number) => {
    const nums = new Set<number>([answer]);
    while (nums.size < 6) {
      const n = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1);
      if (n > 0 && n <= 50) nums.add(n);
    }
    const arr = Array.from(nums).sort(() => Math.random() - 0.5);
    const newBubbles: Bubble[] = arr.map((n, i) => ({
      id: Date.now() + i,
      number: n,
      x: 10 + (i * 15) % 80,
      y: 20 + (i * 10) % 50,
      size: 50 + Math.random() * 30,
      speed: 1 + Math.random() * 2,
    }));
    setBubbles(newBubbles);
  };

  const handlePop = (bubble: Bubble) => {
    if (bubble.number === q.answer) {
      const bonus = streak >= 3 ? 5 : 0;
      setScore(s => s + 10 + bonus);
      setStreak(s => s + 1);
      setMessage(`✅ Benar! +${10 + bonus} ⭐`);
      playSound('win');
      const newAnswer = generateQuestion();
      generateBubbles(newAnswer);
    } else {
      setStreak(0);
      setScore(s => Math.max(0, s - 5));
      setMessage(`❌ Jawaban: ${q.answer}`);
      playSound('click');
    }
    setTimeout(() => setMessage(''), 1200);
  };

  useEffect(() => {
    const answer = generateQuestion();
    generateBubbles(answer);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      const stars = score >= 100 ? 3 : score >= 60 ? 2 : 1;
      onComplete(stars, { score, streak });
      return;
    }
    const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
        <span style={{ color: theme.textSecondary }}>⭐ {score}</span>
        <span style={{ color: timeLeft <= 15 ? '#ef4444' : theme.textSecondary }}>⏱ {timeLeft}s</span>
        {streak >= 3 && <span style={{ color: '#f59e0b', fontWeight: '700' }}>🔥 {streak}x</span>}
      </div>

      {/* Timer Bar */}
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '12px' }}>
        <div style={{
          width: `${(timeLeft / 60) * 100}%`, height: '100%',
          background: timeLeft <= 15 ? '#ef4444' : '#6366f1',
          borderRadius: '3px', transition: 'width 1s',
        }} />
      </div>

      {/* Question */}
      <div style={{
        background: '#6366f1', color: '#fff', borderRadius: '16px',
        padding: '12px 24px', display: 'inline-block', marginBottom: '16px',
        fontSize: '24px', fontWeight: '900', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
      }}>
        {q.text}
      </div>

      {/* Bubbles Area */}
      <div style={{
        position: 'relative', height: '320px',
        background: 'linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%)',
        borderRadius: '20px', overflow: 'hidden',
        cursor: 'pointer',
      }}>
        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => handlePop(bubble)}
            style={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.6)',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(99,102,241,0.4))',
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '900',
              cursor: 'pointer',
              animation: `float ${bubble.speed}s ease-in-out infinite`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {bubble.number}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          marginTop: '10px', padding: '10px', borderRadius: '10px',
          background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          fontWeight: '600', fontSize: '15px',
          animation: 'pop 0.3s ease-out',
        }}>
          {message}
        </div>
      )}

      <p style={{ marginTop: '10px', fontSize: '12px', color: theme.textMuted }}>
        💡 Klik balon dengan jawaban yang benar!
      </p>
    </div>
  );
}