// app/components/games/MathAdventure.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathAdventureProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Obstacle {
  id: number; x: number; question: string; answer: number; options: number[]; passed: boolean;
}

type GameState = 'ready' | 'playing' | 'complete';

const CHARACTERS = ['🦸', '🦹', '🧙', '🦊', '🐱', '🐶', '🦄', '🤖'];

export default function MathAdventure({ onComplete }: MathAdventureProps) {
  const theme = useThemeStyles();
  const [gameState, setGameState] = useState<GameState>('ready');
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [currentObs, setCurrentObs] = useState<Obstacle | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [characterY, setCharacterY] = useState(50);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback((lvl: number) => {
    const ops = lvl === 1 ? ['+', '-'] : lvl === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, ans: number, q: string;
    const max = lvl === 1 ? 20 : lvl === 2 ? 50 : 100;
    switch (op) {
      case '+': a = Math.floor(Math.random() * max) + 1; b = Math.floor(Math.random() * max) + 1; ans = a + b; q = `${a}+${b}=?`; break;
      case '-': a = Math.floor(Math.random() * max) + Math.floor(max/2); b = Math.floor(Math.random() * a) + 1; ans = a - b; q = `${a}-${b}=?`; break;
      case '×': a = Math.floor(Math.random() * (lvl + 4)) + 1; b = Math.floor(Math.random() * (lvl + 4)) + 1; ans = a * b; q = `${a}×${b}=?`; break;
      case '÷': b = Math.floor(Math.random() * 9) + 1; ans = Math.floor(Math.random() * 9) + 1; a = b * ans; q = `${a}÷${b}=?`; break;
      default: a = 0; b = 0; ans = 0; q = '';
    }
    const opts = new Set([ans]);
    while (opts.size < 4) { const off = Math.floor(Math.random() * 10) + 1; opts.add(Math.random() > 0.5 ? ans + off : Math.max(0, ans - off)); }
    return { question: q, answer: ans, options: Array.from(opts).sort(() => Math.random() - 0.5) };
  }, []);

  const endGame = useCallback(() => {
    setGameState('complete');
    if (timeRef.current) clearInterval(timeRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
    onComplete(stars, { score, level, combo });
  }, [score, level, combo, onComplete]);

  const startGame = useCallback(() => {
    setGameState('playing'); setScore(0); setLives(3); setLevel(1); setCombo(0); setTimeLeft(30);
    const obs: Obstacle[] = Array.from({ length: 5 }, (_, i) => ({ id: i, x: 100 + i * 150, ...generateQuestion(1), passed: false }));
    setObstacles(obs);
    if (timeRef.current) clearInterval(timeRef.current);
    timeRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { setLives(l => { const nl = l - 1; if (nl <= 0) { setTimeout(() => endGame(), 100); return 0; } return nl; }); return 30; }
        return p - 1;
      });
    }, 1000);
  }, [generateQuestion, endGame]);

  const handleAnswer = useCallback((ans: number) => {
    if (!currentObs) return;
    setSelected(ans);
    const ok = ans === currentObs.answer;
    setCorrect(ok); setFeedback(true);
    if (ok) {
      setScore(s => s + 10 + combo * 5); setCombo(c => c + 1);
      setObstacles(p => p.map(o => o.id === currentObs.id ? { ...o, passed: true } : o));
      if (obstacles.filter(o => o.passed).length + 1 >= 4) {
        setLevel(l => {
          const nl = l + 1;
          const newObs: Obstacle[] = Array.from({ length: 5 }, (_, i) => ({ id: Date.now() + i, x: 800 + i * 150, ...generateQuestion(nl), passed: false }));
          setObstacles(p => [...p, ...newObs]);
          return nl;
        });
      }
    } else { setCombo(0); setLives(l => { const nl = l - 1; if (nl <= 0) { setTimeout(() => endGame(), 1500); return 0; } return nl; }); }
    setTimeout(() => { setCurrentObs(null); setSelected(null); setFeedback(false); }, 1500);
  }, [currentObs, combo, obstacles, generateQuestion, endGame]);

  const jump = useCallback(() => { setCharacterY(p => (p > 20 ? p - 30 : p)); setTimeout(() => setCharacterY(50), 300); }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => setObstacles(p => p.map(o => ({ ...o, x: o.x - 2 }))), 50);
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const check = setInterval(() => {
        obstacles.forEach(o => { if (!o.passed && o.x < 30 && o.x > 10 && !currentObs) setCurrentObs(o); });
      }, 100);
      return () => clearInterval(check);
    }
  }, [gameState, obstacles, currentObs]);

  useEffect(() => { return () => { if (timeRef.current) clearInterval(timeRef.current); if (gameLoopRef.current) clearInterval(gameLoopRef.current); }; }, []);

  if (gameState === 'ready') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>🎮</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Math Adventure!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Petualangan Seru dengan Matematika!</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {CHARACTERS.slice(0, 4).map((c, i) => (
          <button key={i} onClick={() => setCharacter(c)} style={{ fontSize: '36px', padding: '8px', borderRadius: '12px', border: character === c ? '3px solid #7c3aed' : '3px solid transparent', background: character === c ? '#ede9fe' : theme.bgHover, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      <button onClick={startGame} style={{ padding: '14px 32px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>🚀 Mulai Petualangan!</button>
    </div>
  );

  if (gameState === 'complete') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px' }}>🏆</div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Petualangan Selesai!</h2>
      <p style={{ color: theme.textSecondary }}>Skor: {score} | Level: {level} | Kombo: {combo}x</p>
      <div style={{ fontSize: '40px' }}>{score >= 200 ? '⭐⭐⭐' : score >= 100 ? '⭐⭐' : '⭐'}</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '450px', borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 50%, #8B7355 100%)' }}>
      {/* Clouds */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '30px', opacity: 0.7 }}>☁️</div>
      <div style={{ position: 'absolute', top: '5%', right: '15%', fontSize: '25px', opacity: 0.7 }}>☁️</div>

      {/* Character */}
      <div style={{ position: 'absolute', left: '20%', top: `${characterY}%`, transition: 'top 0.3s', fontSize: '40px' }}>{character}</div>

      {/* Obstacles */}
      {obstacles.filter(o => !o.passed).map(o => (
        <div key={o.id} style={{ position: 'absolute', top: '55%', left: `${o.x}px`, transition: 'left 0.05s' }}>
          <div style={{ fontSize: '30px' }}>🧱</div>
          {currentObs?.id === o.id && <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>{o.question}</div>}
        </div>
      ))}

      {/* HUD */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '700' }}>❤️ {lives}</span>
        <span style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '700' }}>Lv.{level}</span>
        <span style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '700' }}>⭐ {score}</span>
        <span style={{ background: timeLeft <= 10 ? '#fee2e2' : 'rgba(255,255,255,0.8)', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', fontWeight: '700', color: timeLeft <= 10 ? '#ef4444' : '#1e293b' }}>⏱ {timeLeft}s</span>
      </div>
      {combo >= 3 && <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', borderRadius: '20px', padding: '4px 12px', fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>🔥 {combo}x</div>}

      {/* Answer Modal */}
      {currentObs && !feedback && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', width: '90%', maxWidth: '320px', textAlign: 'center' }}>
          <p style={{ fontWeight: '700', marginBottom: '8px' }}>{currentObs.question}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {currentObs.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(opt)} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>{correct ? '🎉' : '💥'}</div>
          <p style={{ fontWeight: '700', color: correct ? '#10b981' : '#ef4444' }}>{correct ? `+${10 + combo * 5} Poin!` : 'Salah!'}</p>
        </div>
      )}

      {/* Jump Button */}
      <button onClick={jump} style={{ position: 'absolute', bottom: '12px', right: '12px', width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.8)', fontSize: '22px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>⬆️</button>
    </div>
  );
}