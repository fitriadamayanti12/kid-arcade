// app/components/games/MathTower.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathTowerProps {
  onComplete: (stars: number, extra?: any) => void;
}

const ENEMIES_TYPES = [
  { emoji: '🐗', hp: 20, speed: 0.5, dmg: 1 },
  { emoji: '🐺', hp: 30, speed: 0.8, dmg: 1 },
  { emoji: '🐻', hp: 50, speed: 0.4, dmg: 2 },
  { emoji: '🐉', hp: 80, speed: 0.3, dmg: 3 },
  { emoji: '👹', hp: 100, speed: 0.2, dmg: 5 },
];

export default function MathTower({ onComplete }: MathTowerProps) {
  const theme = useThemeStyles();
  const [tower, setTower] = useState({ lv: 1, dmg: 10, emoji: '🏰' });
  const [enemies, setEnemies] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(50);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(5);
  const [selected, setSelected] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [step, setStep] = useState<'play' | 'complete'>('play');
  const [kills, setKills] = useState(0);

  const loopRef = useRef<NodeJS.Timeout | null>(null);

  const genQ = (w: number) => {
    const a = Math.floor(Math.random() * 20 * w) + 1;
    const b = Math.floor(Math.random() * 15 * w) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { q: `${a} ${op} ${b} = ?`, ans };
  };

  const spawnEnemy = () => {
    const t = ENEMIES_TYPES[Math.min(wave - 1, ENEMIES_TYPES.length - 1)];
    const hpM = 1 + (wave - 1) * 0.3;
    setEnemies(p => [...p, { id: Date.now(), hp: Math.round(t.hp * hpM), maxHp: Math.round(t.hp * hpM), x: 0, speed: t.speed, emoji: t.emoji, q: genQ(wave), dmg: t.dmg }]);
  };

  useEffect(() => {
    // Spawn wave
    const count = 3 + wave;
    let spawned = 0;
    const iv = setInterval(() => { if (spawned < count) { spawnEnemy(); spawned++; } else clearInterval(iv); }, 1500);
    return () => clearInterval(iv);
  }, [wave]);

  useEffect(() => {
    loopRef.current = setInterval(() => {
      setEnemies(p => {
        const updated = p.map(e => ({ ...e, x: e.x + e.speed }));
        const reached = updated.filter(e => e.x >= 85);
        reached.forEach(() => setLives(l => { const nl = l - 1; if (nl <= 0) setStep('complete'); return Math.max(0, nl); }));
        const remaining = updated.filter(e => e.x < 85);
        return remaining;
      });
    }, 100);
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, []);

  const attack = () => {
    if (!selected || !answer || feedback) return;
    const ok = parseInt(answer) === selected.q.ans;
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) {
      const nh = selected.hp - tower.dmg;
      if (nh <= 0) {
        setEnemies(p => p.filter(e => e.id !== selected.id));
        setScore(s => s + selected.maxHp);
        setGold(g => g + 10);
        setKills(k => {
          const nk = k + 1;
          if (nk % 5 === 0) setTower(t => ({ lv: t.lv + 1, dmg: t.dmg + 5, emoji: t.lv >= 5 ? '🏯' : t.lv >= 3 ? '🏛️' : '🏰' }));
          return nk;
        });
      } else {
        setEnemies(p => p.map(e => e.id === selected.id ? { ...e, hp: nh } : e));
      }
      setSelected(null); setAnswer('');
    }
    setTimeout(() => setFeedback(null), 800);
  };

  const upgrade = () => {
    const cost = tower.lv * 30;
    if (gold >= cost) { setGold(g => g - cost); setTower(t => ({ lv: t.lv + 1, dmg: t.dmg + 8, emoji: t.lv >= 5 ? '🏯' : t.lv >= 3 ? '🏛️' : '🏰' })); }
  };

  const handleComplete = () => {
    const stars = wave >= 5 ? 3 : wave >= 3 ? 2 : 1;
    onComplete(stars, { score, wave, kills });
  };

  if (step === 'complete') {
    const stars = wave >= 5 ? 3 : wave >= 3 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>💔</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Menara Jatuh!</h2>
        <p style={{ color: theme.textSecondary }}>Wave: {wave} | Kill: {kills} | Skor: {score}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', background: theme.bg, minHeight: '400px' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>❤️ {lives}</span>
        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>⭐ {score}</span>
        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>🪙 {gold}</span>
        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>🌊 {wave}</span>
        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700' }}>💀 {kills}</span>
      </div>

      {/* Arena */}
      <div style={{ background: 'linear-gradient(180deg, #87CEEB, #90EE90, #8B7355)', borderRadius: '16px', height: '300px', position: 'relative', overflow: 'hidden', marginBottom: '12px', border: '3px solid #5C4033' }}>
        <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '50px', background: '#8B7355', borderRadius: '25px', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', fontSize: '40px', zIndex: 10 }}>{tower.emoji}</div>
        {enemies.map(e => (
          <button key={e.id} onClick={() => { setSelected(e); setAnswer(''); setFeedback(null); }} disabled={!!feedback} style={{
            position: 'absolute', left: `${5 + e.x}%`, top: `${40 + Math.random() * 10}%`, fontSize: '28px',
            background: 'none', border: 'none', cursor: 'pointer', transform: selected?.id === e.id ? 'scale(1.2)' : 'scale(1)',
          }}>
            {e.emoji}
            <div style={{ width: '30px', height: '3px', background: '#374151', borderRadius: '2px', margin: '0 auto' }}>
              <div style={{ width: `${(e.hp / e.maxHp) * 100}%`, height: '100%', background: e.hp > e.maxHp * 0.5 ? '#10b981' : '#ef4444', borderRadius: '2px' }} />
            </div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center' }}>
        {enemies.length === 0 && !selected ? (
          <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '12px', marginBottom: '8px' }}>
            <p style={{ fontWeight: '700', color: '#065f46' }}>🎉 Wave {wave} Selesai!</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
              <button onClick={() => { setWave(w => w + 1); setGold(g => g + 50); }} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>⚔️ Wave {wave + 1}</button>
              <button onClick={upgrade} disabled={gold < tower.lv * 30} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: gold >= tower.lv * 30 ? '#f59e0b' : '#d1d5db', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>⬆️ ({tower.lv * 30}🪙)</button>
            </div>
          </div>
        ) : selected ? (
          <div style={{ padding: '12px', background: theme.bgCard, borderRadius: '12px', boxShadow: theme.shadow }}>
            <p style={{ fontWeight: '700', color: theme.heading }}>{selected.emoji} HP: {selected.hp}/{selected.maxHp}</p>
            <p style={{ fontSize: '18px', fontWeight: '700', color: theme.heading }}>{selected.q.q}</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
              <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && attack()} placeholder="?" style={{ width: '70px', padding: '8px', fontSize: '16px', textAlign: 'center', borderRadius: '8px', border: `2px solid ${theme.border}`, background: theme.input, color: theme.text, outline: 'none' }} autoFocus />
              <button onClick={attack} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>⚔️</button>
            </div>
          </div>
        ) : (
          <p style={{ color: theme.textMuted, fontSize: '13px' }}>👆 Klik musuh untuk menyerang!</p>
        )}
        {feedback && (
          <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', background: feedback === 'correct' ? '#d1fae5' : '#fee2e2', color: feedback === 'correct' ? '#065f46' : '#991b1b', fontWeight: '600' }}>
            {feedback === 'correct' ? '🎯 Tepat!' : '❌ Melenceng!'}
          </div>
        )}
      </div>
    </div>
  );
}