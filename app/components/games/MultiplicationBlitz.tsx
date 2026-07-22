// app/components/games/MultiplicationBlitz.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MultiplicationBlitzProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface FallingCard {
  id: number; question: string; answer: number; x: number; y: number; speed: number; emoji: string; table: number;
}

interface UnlockedTable {
  number: number; emoji: string; color: string; unlocked: boolean; mastered: boolean; highScore: number;
}

interface PowerUp {
  emoji: string; name: string; cost: number; duration?: number; instant?: boolean;
}

const TABLE_EMOJIS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: '🌟', color: '#FFD700' }, 2: { emoji: '👀', color: '#FF6B6B' }, 3: { emoji: '🎨', color: '#4ECDC4' },
  4: { emoji: '🍀', color: '#45B7D1' }, 5: { emoji: '🖐️', color: '#96CEB4' }, 6: { emoji: '🎲', color: '#FFEAA7' },
  7: { emoji: '🌈', color: '#DDA0DD' }, 8: { emoji: '❄️', color: '#98D8C8' }, 9: { emoji: '🎯', color: '#F7DC6F' },
  10: { emoji: '💯', color: '#BB8FCE' },
};

const POWER_UPS: Record<string, PowerUp> = {
  SLOW: { emoji: '🐌', name: 'Slow', cost: 50, duration: 5000 },
  FREEZE: { emoji: '❄️', name: 'Freeze', cost: 100, duration: 3000 },
  BOMB: { emoji: '💣', name: 'Bomb', cost: 75, instant: true },
  DOUBLE: { emoji: '✨', name: 'Double', cost: 60, duration: 8000 },
  SHIELD: { emoji: '🛡️', name: 'Shield', cost: 40, duration: 10000 },
};

export default function MultiplicationBlitz({ onComplete }: MultiplicationBlitzProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [tables, setTables] = useState<number[]>([2, 3, 4]);
  const [cards, setCards] = useState<FallingCard[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [coins, setCoins] = useState(0);
  const [activePU, setActivePU] = useState<string | null>(null);
  const [puTimer, setPuTimer] = useState(0);
  const [showPU, setShowPU] = useState(false);
  const [unlocked, setUnlocked] = useState<UnlockedTable[]>(
    Array.from({ length: 10 }, (_, i) => ({ number: i + 1, emoji: TABLE_EMOJIS[i + 1]?.emoji || '📝', color: TABLE_EMOJIS[i + 1]?.color || '#ccc', unlocked: i < 3, mastered: false, highScore: 0 }))
  );

  const loopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cid = useRef(0);

  const spawnCard = useCallback(() => {
    const t = tables[Math.floor(Math.random() * tables.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    setCards(p => [...p, { id: cid.current++, question: `${t}×${m}`, answer: t * m, x: Math.random() * 80 + 10, y: -10, speed: (1 + level * 0.3 + Math.random() * 2) * speed, emoji: TABLE_EMOJIS[t]?.emoji || '📝', table: t }]);
  }, [tables, level, speed]);

  const activatePU = (type: string) => {
    const pu = POWER_UPS[type];
    if (!pu || coins < pu.cost) return;
    setCoins(c => c - pu.cost);
    if (pu.instant) {
      setCards([]);
    } else if (pu.duration) {
      setActivePU(type);
      setPuTimer(pu.duration / 1000);
      if (type === 'SLOW') setSpeed(s => s * 0.3);
      if (type === 'FREEZE') {
        setCards(p => p.map(c => ({ ...c, speed: 0 })));
        setTimeout(() => setCards(p => p.map(c => ({ ...c, speed: (1 + level * 0.3) * speed }))), pu.duration);
      }
    }
  };

  useEffect(() => {
    if (step !== 'play') return;
    loopRef.current = setInterval(() => {
      setCards(p => {
        const up = p.map(c => ({ ...c, y: c.y + c.speed }));
        up.filter(c => c.y >= 90).forEach(() => {
          setLives(l => { const nl = l - 1; if (nl <= 0) setTimeout(() => setStep('complete'), 500); return Math.max(0, nl); });
          setCombo(0);
        });
        return up.filter(c => c.y < 90);
      });
    }, 50);
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [step]);

  useEffect(() => {
    if (step !== 'play') return;
    const rate = Math.max(400, 1800 - level * 120);
    spawnRef.current = setInterval(spawnCard, rate);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [step, level, spawnCard]);

  useEffect(() => {
    if (puTimer > 0 && activePU) {
      const t = setInterval(() => setPuTimer(p => { if (p <= 1) { setActivePU(null); return 0; } return p - 1; }), 1000);
      return () => clearInterval(t);
    }
  }, [puTimer, activePU]);

  const handleAnswer = (ans: number, cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const ok = ans === card.answer;
    if (ok) {
      const pts = (10 + Math.floor(combo / 5) * 10) * (activePU === 'DOUBLE' ? 2 : 1);
      setScore(s => s + pts); setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
      setCoins(c => c + Math.floor(pts / 2));
      setCards(p => p.filter(c => c.id !== cardId));
      if ((score + pts) % 100 < pts) { setLevel(l => l + 1); setSpeed(s => s + 0.2); }
    } else {
      setCombo(0);
      if (activePU !== 'SHIELD') setLives(l => { const nl = l - 1; if (nl <= 0) setTimeout(() => setStep('complete'), 500); return Math.max(0, nl); });
    }
  };

  const start = () => {
    setCards([]); setScore(0); setCombo(0); setMaxCombo(0); setLives(5); setLevel(1); setSpeed(1); setCoins(0); setActivePU(null); setStep('play'); cid.current = 0;
    setTables(unlocked.filter(t => t.unlocked).map(t => t.number));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleComplete = () => {
    const mastered = unlocked.filter(t => t.mastered).length;
    const stars = mastered >= 8 ? 3 : mastered >= 5 ? 2 : 1;
    onComplete(stars, { score, maxCombo, tablesMastered: mastered, level });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>⚡</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Multiplication Blitz!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Hafalkan perkalian dengan cepat!</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '16px' }}>
        {unlocked.map(t => (
          <button key={t.number} onClick={() => { if (!t.unlocked) return; setTables(p => p.includes(t.number) ? p.filter(x => x !== t.number) : [...p, t.number]); }} disabled={!t.unlocked} style={{
            padding: '10px', borderRadius: '10px', border: tables.includes(t.number) ? `3px solid ${t.color}` : '2px solid #ddd',
            background: t.mastered ? '#d1fae5' : tables.includes(t.number) ? '#ede9fe' : '#fff',
            cursor: t.unlocked ? 'pointer' : 'not-allowed', opacity: t.unlocked ? 1 : 0.4, fontWeight: '700', fontSize: '14px',
          }}>{t.emoji}<br/>×{t.number}{t.mastered && ' ✅'}</button>
        ))}
      </div>
      <button onClick={start} disabled={tables.length === 0} style={{ padding: '14px 32px', borderRadius: '999px', border: 'none', background: tables.length > 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : '#d1d5db', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>⚡ MULAI BLITZ!</button>
    </div>
  );

  if (step === 'complete') {
    const mastered = unlocked.filter(t => t.mastered).length;
    const stars = mastered >= 8 ? 3 : mastered >= 5 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Blitz Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Skor: {score} | Kombo: {maxCombo}x | Level: {level}</p>
        <p style={{ color: theme.textSecondary }}>Tabel Dikuasai: {mastered}/10</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={start} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🔄 Main Lagi</button>
          <button onClick={handleComplete} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={areaRef} style={{ maxWidth: '600px', margin: '0 auto', padding: '10px', background: theme.bg, minHeight: '400px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.8)', borderRadius: '12px', color: '#fff', fontSize: '13px', flexWrap: 'wrap', gap: '4px' }}>
        <span>⭐{score}</span><span>🔥{combo}</span><span>Lv.{level}</span><span>🪙{coins}</span>
        <span>{Array.from({ length: lives }).map((_, i) => '❤️').join('')}</span>
        {activePU && <span style={{ background: '#fbbf24', color: '#000', padding: '2px 6px', borderRadius: '6px', fontSize: '11px' }}>{POWER_UPS[activePU]?.emoji} {puTimer}s</span>}
        <button onClick={() => setShowPU(!showPU)} style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>⚡</button>
      </div>
      {showPU && (
        <div style={{ position: 'absolute', top: '50px', right: '10px', background: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 50, minWidth: '180px' }}>
          {Object.entries(POWER_UPS).map(([k, v]) => (
            <button key={k} onClick={() => { activatePU(k); setShowPU(false); }} disabled={coins < v.cost || activePU === k} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px', border: 'none', background: coins >= v.cost ? '#f5f3ff' : '#f5f5f5', borderRadius: '6px', cursor: coins >= v.cost ? 'pointer' : 'default', opacity: coins >= v.cost ? 1 : 0.5, marginBottom: '4px' }}>
              <span>{v.emoji}</span><span style={{ fontWeight: '600', fontSize: '12px' }}>{v.name}</span><span style={{ fontSize: '10px', color: '#666' }}>🪙{v.cost}</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ height: '400px', background: 'linear-gradient(180deg, #1a1a2e, #16213e, #0f3460)', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '2px solid #7c3aed' }}>
        {cards.map(c => (
          <div key={c.id} onClick={() => { const ans = prompt(`Berapa ${c.question}?`); if (ans) { const a = parseInt(ans); if (!isNaN(a)) handleAnswer(a, c.id); } }} style={{
            position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, background: 'linear-gradient(135deg, #FFD700, #FFA500)', padding: '10px 16px', borderRadius: '12px',
            fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(255,215,0,0.3)', zIndex: 10, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap',
          }}>{c.emoji} {c.question}=?</div>
        ))}
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', right: '5%', height: '2px', background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}>
          <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', color: '#ef4444', fontSize: '11px' }}>⚠️ Jangan jatuh!</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted }}>Ketik jawaban:</span>
        <input ref={inputRef} type="number" onKeyDown={e => {
          if (e.key === 'Enter') { const v = parseInt(e.currentTarget.value); if (!isNaN(v) && cards.length > 0) { const sorted = [...cards].sort((a, b) => b.y - a.y); handleAnswer(v, sorted[0].id); } e.currentTarget.value = ''; }
        }} placeholder="?" style={{ width: '70px', padding: '6px', fontSize: '16px', textAlign: 'center', borderRadius: '8px', border: '2px solid #7c3aed', outline: 'none' }} />
      </div>
    </div>
  );
}