// app/components/games/MathRacer.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathRacerProps {
  onComplete: (stars: number, extra?: any) => void;
}

const CARS = ['🚗', '🚙', '🏎️', '🚓', '🚕', '🚐'];
const FINISH = 450;

export default function MathRacer({ onComplete }: MathRacerProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'countdown' | 'race' | 'quiz' | 'complete'>('menu');
  const [player, setPlayer] = useState({ x: 0, speed: 0, emoji: '🚗' });
  const [ai, setAI] = useState([{ x: 0, speed: 0, emoji: '🏎️', name: 'Speedy' }, { x: 0, speed: 0, emoji: '🚓', name: 'Policia' }, { x: 0, speed: 0, emoji: '🚕', name: 'Taxi' }]);
  const [q, setQ] = useState<{ text: string; answer: number; opts: number[] } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [lap, setLap] = useState(1);
  const [pos, setPos] = useState(1);
  const [count, setCount] = useState(3);
  const [time, setTime] = useState(0);
  const [boost, setBoost] = useState(0);
  const [obs, setObs] = useState<string | null>(null);

  const raceRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const genQ = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a: number, b: number, ans: number;
    switch (op) {
      case '+': a = Math.floor(Math.random() * 30) + 5; b = Math.floor(Math.random() * 30) + 5; ans = a + b; break;
      case '-': a = Math.floor(Math.random() * 40) + 10; b = Math.floor(Math.random() * a) + 1; ans = a - b; break;
      case '×': a = Math.floor(Math.random() * 6) + 2; b = Math.floor(Math.random() * 6) + 2; ans = a * b; break;
      default: a = 0; b = 0; ans = 0;
    }
    const opts = new Set([ans]);
    while (opts.size < 4) { const off = Math.floor(Math.random() * 8) + 1; opts.add(Math.random() > 0.5 ? ans + off : Math.max(0, ans - off)); }
    return { text: `${a} ${op} ${b} = ?`, answer: ans, opts: Array.from(opts).sort(() => Math.random() - 0.5) };
  }, []);

  const start = () => {
    setStep('countdown'); setCount(3); setPlayer({ x: 0, speed: 0, emoji: player.emoji });
    setAI([{ x: 0, speed: 0, emoji: '🏎️', name: 'Speedy' }, { x: 0, speed: 0, emoji: '🚓', name: 'Policia' }, { x: 0, speed: 0, emoji: '🚕', name: 'Taxi' }]);
    setScore(0); setLap(1); setBoost(0); setTime(0);
    let c = 3;
    const iv = setInterval(() => { c--; setCount(c); if (c <= 0) { clearInterval(iv); setStep('race'); startLoop(); startTimer(); } }, 1000);
  };

  const startLoop = () => {
    if (raceRef.current) clearInterval(raceRef.current);
    raceRef.current = setInterval(() => {
      setPlayer(p => {
        const nx = p.x + p.speed;
        if (nx >= FINISH) { handleLap(); return { ...p, x: FINISH, speed: 0 }; }
        return { ...p, x: nx, speed: Math.max(0, p.speed - 0.1) };
      });
      setAI(prev => prev.map(c => ({ ...c, x: c.x + c.speed + Math.random() * 2, speed: Math.random() * 3 + 1 })));
      // Obstacles
      [100, 200, 300, 400].forEach(ox => {
        if (Math.abs(player.x - ox) < 5 && !obs) {
          setObs(ox === 400 ? '⭐' : ox === 200 ? '⚡' : '🛑');
          setStep('quiz'); setQ(genQ());
        }
      });
    }, 100);
  };

  const startTimer = () => { if (timeRef.current) clearInterval(timeRef.current); timeRef.current = setInterval(() => setTime(t => t + 1), 1000); };

  const handleLap = () => {
    if (lap >= 3) { setStep('complete'); if (raceRef.current) clearInterval(raceRef.current); if (timeRef.current) clearInterval(timeRef.current); }
    else { setLap(l => l + 1); setPlayer(p => ({ ...p, x: 0 })); setScore(s => s + 50); }
  };

  const handleAnswer = (ans: number) => {
    if (!q || feedback) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok); setFeedback(true);
    if (ok) {
      const b = obs === '⚡' ? 8 : obs === '⭐' ? 10 : 5;
      const pts = obs === '⭐' ? 30 : obs === '⚡' ? 20 : 10;
      setPlayer(p => ({ ...p, speed: p.speed + b })); setScore(s => s + pts); setBoost(b => Math.min(100, b + 20));
    } else {
      setPlayer(p => ({ ...p, speed: Math.max(0, p.speed - 2) }));
      if (obs === '🛑') setPlayer(p => ({ ...p, x: Math.max(0, p.x - 10) }));
    }
    setTimeout(() => { setSelected(null); setFeedback(false); setQ(null); setObs(null); setStep('race'); }, 800);
  };

  useEffect(() => { return () => { if (raceRef.current) clearInterval(raceRef.current); if (timeRef.current) clearInterval(timeRef.current); }; }, []);

  const handleComplete = () => {
    const stars = pos === 1 ? 3 : pos <= 2 ? 2 : 1;
    onComplete(stars, { score, position: pos, time, lap });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>🏁</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Math Racer!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Balapan seru dengan matematika!</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {CARS.slice(0, 4).map((c, i) => (
          <button key={i} onClick={() => setPlayer(p => ({ ...p, emoji: c }))} style={{ fontSize: '36px', padding: '8px', borderRadius: '12px', border: player.emoji === c ? '3px solid #ef4444' : '3px solid transparent', background: player.emoji === c ? '#fee2e2' : theme.bgHover, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      <button onClick={start} style={{ padding: '14px 32px', borderRadius: '999px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>🏁 Mulai Balapan!</button>
    </div>
  );

  if (step === 'countdown') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', background: theme.bg }}>
      <div style={{ fontSize: '80px', fontWeight: '900', color: '#ef4444', animation: 'pulse 1s ease-in-out infinite' }}>{count}</div>
    </div>
  );

  if (step === 'complete') {
    const stars = pos === 1 ? 3 : pos <= 2 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>{pos === 1 ? '🏆' : pos === 2 ? '🥈' : '🥉'}</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Balapan Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Posisi: #{pos} | Waktu: {time}s | Skor: {score}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', background: theme.bg, minHeight: '400px' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ background: '#1e293b', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>🏁 Lap {lap}/3</span>
        <span style={{ background: '#fbbf24', borderRadius: '20px', padding: '4px 10px', fontWeight: '700', color: '#1e293b' }}>#{pos}</span>
        <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>⏱ {time}s</span>
        <span style={{ background: '#10b981', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>⭐ {score}</span>
        <div style={{ width: '80px', height: '8px', background: theme.border, borderRadius: '4px', alignSelf: 'center' }}>
          <div style={{ width: `${boost}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Track */}
      <div style={{ background: 'linear-gradient(180deg, #374151, #1f2937)', borderRadius: '16px', padding: '20px', position: 'relative', height: '250px', overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{ position: 'absolute', top: '50%', left: `${(FINISH / 500) * 100}%`, bottom: 0, width: '3px', background: '#fff' }} />
        {ai.map((c, i) => (
          <div key={i} style={{ position: 'absolute', top: `${20 + i * 25}%`, left: `${(c.x / 500) * 100}%`, fontSize: '24px', transition: 'left 0.1s' }}>{c.emoji}</div>
        ))}
        <div style={{ position: 'absolute', top: '70%', left: `${(player.x / 500) * 100}%`, fontSize: '30px', transition: 'left 0.1s', filter: player.speed > 5 ? 'brightness(1.3)' : 'none' }}>{player.emoji}</div>
        {[100, 200, 300, 400].map(ox => (
          <div key={ox} style={{ position: 'absolute', top: '55%', left: `${(ox / 500) * 100}%`, fontSize: '20px' }}>{obs && Math.abs(player.x - ox) < 10 ? '❗' : ox === 400 ? '⭐' : ox === 200 ? '⚡' : '🛑'}</div>
        ))}
      </div>

      {/* Speed */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <span style={{ background: '#1e293b', color: '#fff', borderRadius: '20px', padding: '6px 14px', fontWeight: '700', fontSize: '13px' }}>🏎️ {Math.round(player.speed * 10)} km/h</span>
      </div>

      {/* Quiz Modal */}
      {step === 'quiz' && q && !feedback && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => {}}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', maxWidth: '300px', width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>{obs === '⭐' ? '⭐' : obs === '⚡' ? '⚡' : '🛑'}</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>{q.text}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {q.opts.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>{opt}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 50 }}>
          <div style={{ fontSize: '50px' }}>{correct ? '🚀' : '💥'}</div>
          <p style={{ fontWeight: '700', color: correct ? '#10b981' : '#ef4444' }}>{correct ? 'NGEBUT!' : 'MELAMBAT!'}</p>
        </div>
      )}
    </div>
  );
}