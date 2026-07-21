// app/components/games/MultiplicationBlitz.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MultiplicationBlitzProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface FallingCard {
  id: number;
  question: string;
  answer: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
  table: number;
}

interface UnlockedTable {
  number: number;
  emoji: string;
  color: string;
  unlocked: boolean;
  mastered: boolean;
  highScore: number;
}

interface PowerUp {
  emoji: string;
  name: string;
  cost: number;
  duration?: number;
  instant?: boolean;
}

const TABLE_EMOJIS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: '🌟', color: '#FFD700' },
  2: { emoji: '👀', color: '#FF6B6B' },
  3: { emoji: '🎨', color: '#4ECDC4' },
  4: { emoji: '🍀', color: '#45B7D1' },
  5: { emoji: '🖐️', color: '#96CEB4' },
  6: { emoji: '🎲', color: '#FFEAA7' },
  7: { emoji: '🌈', color: '#DDA0DD' },
  8: { emoji: '❄️', color: '#98D8C8' },
  9: { emoji: '🎯', color: '#F7DC6F' },
  10: { emoji: '💯', color: '#BB8FCE' },
};

const POWER_UPS: Record<string, PowerUp> = {
  SLOW: { emoji: '🐌', name: 'Slow Motion', cost: 50, duration: 5000 },
  FREEZE: { emoji: '❄️', name: 'Freeze All', cost: 100, duration: 3000 },
  BOMB: { emoji: '💣', name: 'Clear Screen', cost: 75, instant: true },
  DOUBLE: { emoji: '✨', name: 'Double Points', cost: 60, duration: 8000 },
  SHIELD: { emoji: '🛡️', name: 'Shield', cost: 40, duration: 10000 },
};

export default function MultiplicationBlitz({ onComplete }: MultiplicationBlitzProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'complete'>('menu');
  const [selectedTables, setSelectedTables] = useState<number[]>([1, 2, 3]);
  const [cards, setCards] = useState<FallingCard[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [coins, setCoins] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showPowerUpMenu, setShowPowerUpMenu] = useState(false);
  const [unlockedTables, setUnlockedTables] = useState<UnlockedTable[]>(
    Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      emoji: TABLE_EMOJIS[i + 1]?.emoji || '📝',
      color: TABLE_EMOJIS[i + 1]?.color || '#ccc',
      unlocked: i < 3,
      mastered: false,
      highScore: 0,
    }))
  );
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardIdCounter = useRef(0);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };

  const spawnCard = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const multiplier = Math.floor(Math.random() * 10) + 1;
    const answer = table * multiplier;
    const emoji = TABLE_EMOJIS[table]?.emoji || '📝';
    
    const newCard: FallingCard = {
      id: cardIdCounter.current++,
      question: `${table} × ${multiplier}`,
      answer,
      x: Math.random() * 80 + 10,
      y: -10,
      speed: (1 + level * 0.3 + Math.random() * 2) * speedMultiplier,
      emoji,
      table,
    };
    
    setCards(prev => [...prev, newCard]);
  }, [gameState, selectedTables, level, speedMultiplier]);

  const activatePowerUp = (type: string) => {
    const powerUp = POWER_UPS[type];
    if (!powerUp || coins < powerUp.cost) return;
    
    setCoins(c => c - powerUp.cost);
    
    if (powerUp.instant) {
      setCards([]);
      addFloatingText(`${powerUp.emoji} ${powerUp.name}!`, 50, 50, '#FFD700');
    } else if (powerUp.duration) {
      setActivePowerUp(type);
      setPowerUpTimer(powerUp.duration / 1000);
      if (type === 'SLOW') setSpeedMultiplier(s => s * 0.3);
      if (type === 'FREEZE') {
        setCards(prev => prev.map(c => ({ ...c, speed: 0 })));
        setTimeout(() => {
          setCards(prev => prev.map(c => ({ 
            ...c, 
            speed: (1 + level * 0.3) * speedMultiplier 
          })));
        }, powerUp.duration);
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setCards(prev => {
        const updated = prev.map(card => ({
          ...card,
          y: card.y + card.speed,
        }));

        const fallen = updated.filter(c => c.y >= 90);
        if (fallen.length > 0) {
          fallen.forEach(() => {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setTimeout(() => setGameState('complete'), 500);
                return 0;
              }
              return newLives;
            });
            setCombo(0);
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 300);
          });
        }

        return updated.filter(c => c.y < 90);
      });
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnRate = Math.max(500, 2000 - level * 150);
    spawnRef.current = setInterval(spawnCard, spawnRate);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState, level, spawnCard]);

  useEffect(() => {
    if (correctCount >= level * 5) {
      setLevel(l => l + 1);
      setSpeedMultiplier(s => s + 0.2);
      addFloatingText('⬆️ Level Up!', 50, 30, '#FFD700');
    }
  }, [correctCount, level]);

  useEffect(() => {
    if (powerUpTimer > 0 && activePowerUp) {
      const timer = setInterval(() => {
        setPowerUpTimer(t => {
          if (t <= 1) {
            setActivePowerUp(null);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [powerUpTimer, activePowerUp]);

  const handleAnswer = (answer: number, cardId: number, x: number, y: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const correct = answer === card.answer;
    setTotalAnswered(t => t + 1);

    if (correct) {
      const comboBonus = Math.floor(combo / 5) * 10;
      const basePoints = 10;
      const points = (basePoints + comboBonus) * (activePowerUp === 'DOUBLE' ? 2 : 1);
      
      setScore(s => s + points);
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        if (newCombo % 10 === 0) {
          addFloatingText(`🔥 ${newCombo} COMBO!`, x, y, '#FF4500');
        }
        return newCombo;
      });
      setCorrectCount(c => c + 1);
      setCoins(c => c + Math.floor(points / 2));
      
      const tableIndex = unlockedTables.findIndex(t => t.number === card.table);
      if (tableIndex >= 0 && !unlockedTables[tableIndex].mastered && correctCount > 0 && correctCount % 20 === 0) {
        setUnlockedTables(prev => prev.map((t, i) => 
          i === tableIndex ? { ...t, mastered: true } : t
        ));
        addFloatingText(`🎓 Tabel ${card.table} Dikuasai!`, 50, 40, '#00FF00');
        
        const nextTable = card.table + 1;
        if (nextTable <= 10) {
          setUnlockedTables(prev => prev.map(t => 
            t.number === nextTable ? { ...t, unlocked: true } : t
          ));
          addFloatingText(`🔓 Tabel ${nextTable} Terbuka!`, 50, 50, '#FFD700');
        }
      }
      
      addFloatingText(`+${points}`, x, y - 10, '#4CAF50');
      setCards(prev => prev.filter(c => c.id !== cardId));
    } else {
      setCombo(0);
      if (activePowerUp !== 'SHIELD') {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setTimeout(() => setGameState('complete'), 500);
            return 0;
          }
          return newLives;
        });
      }
      addFloatingText('❌', x, y, '#FF0000');
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 200);
    }
  };

  const startGame = () => {
    setCards([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(5);
    setLevel(1);
    setCorrectCount(0);
    setTotalAnswered(0);
    setSpeedMultiplier(1);
    setCoins(0);
    setActivePowerUp(null);
    setPowerUpTimer(0);
    setGameState('playing');
    cardIdCounter.current = 0;
    
    const tables = unlockedTables.filter(t => t.unlocked).map(t => t.number);
    setSelectedTables(tables);
    
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleComplete = () => {
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const tablesMastered = unlockedTables.filter(t => t.mastered).length;
    
    onComplete(stars, { 
      score, 
      maxCombo, 
      tablesMastered, 
      accuracy: Math.round(accuracy),
      level 
    });
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt(e.currentTarget.value);
      if (!isNaN(value)) {
        const sortedCards = [...cards].sort((a, b) => b.y - a.y);
        if (sortedCards.length > 0) {
          const target = sortedCards[0];
          const rect = gameAreaRef.current?.getBoundingClientRect();
          const x = rect ? (target.x / 100) * rect.width : 200;
          const y = rect ? (target.y / 100) * rect.height : 300;
          handleAnswer(value, target.id, x, y);
        }
      }
      e.currentTarget.value = '';
    }
  };

  if (gameState === 'menu') {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '8px' }}>⚡</div>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#7C3AED', marginBottom: '4px' }}>
          Multiplication Blitz!
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Hafalkan perkalian dengan cara seru!</p>

        <div style={{ background: '#F5F3FF', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>📊 Pilih Tabel Perkalian:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {unlockedTables.map(table => (
              <button
                key={table.number}
                onClick={() => {
                  if (!table.unlocked) return;
                  setSelectedTables(prev => 
                    prev.includes(table.number) 
                      ? prev.filter(t => t !== table.number)
                      : [...prev, table.number]
                  );
                }}
                disabled={!table.unlocked}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: selectedTables.includes(table.number) ? `3px solid ${table.color}` : '2px solid #ddd',
                  background: table.mastered ? '#D1FAE5' : selectedTables.includes(table.number) ? '#EDE9FE' : 'white',
                  cursor: table.unlocked ? 'pointer' : 'not-allowed',
                  opacity: table.unlocked ? 1 : 0.4,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  position: 'relative',
                }}
              >
                {table.emoji}
                <div style={{ fontSize: '12px' }}>×{table.number}</div>
                {table.mastered && <div style={{ fontSize: '12px', color: '#059669' }}>✅</div>}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={selectedTables.length === 0}
          style={{
            padding: '16px 48px',
            fontSize: '22px',
            fontWeight: 'bold',
            borderRadius: '999px',
            border: 'none',
            background: selectedTables.length > 0 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : '#ccc',
            color: 'white',
            cursor: selectedTables.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          }}
        >
          ⚡ MULAI BLITZ!
        </button>
      </div>
    );
  }

  if (gameState === 'complete') {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '28px', color: '#7C3AED' }}>Blitz Selesai!</h2>
        <div style={{ background: '#F5F3FF', borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
          <p style={{ fontSize: '18px' }}>Skor: <strong>{score}</strong></p>
          <p style={{ fontSize: '18px' }}>Akurasi: <strong>{accuracy}%</strong></p>
          <p style={{ fontSize: '18px' }}>Kombo Terbaik: <strong>🔥 {maxCombo}</strong></p>
          <p style={{ fontSize: '18px' }}>Level: <strong>{level}</strong></p>
          <p style={{ fontSize: '18px' }}>Tabel Dikuasai: <strong>{unlockedTables.filter(t => t.mastered).length}/10</strong></p>
        </div>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={startGame} style={{ padding: '10px 24px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            🔄 Main Lagi
          </button>
          <button onClick={handleComplete} style={{ padding: '10px 24px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            🏆 Klaim Hadiah
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameAreaRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '10px', position: 'relative', transform: screenShake ? 'translateX(5px)' : 'none', transition: 'transform 0.1s' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', padding: '8px 16px', background: 'rgba(0,0,0,0.8)', borderRadius: '16px', color: 'white' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>⭐ {score}</span>
          <span>🔥 {combo}</span>
          <span>🎯 Lv.{level}</span>
          <span>🪙 {coins}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{Array.from({ length: lives }).map((_, i) => '❤️').join('')}</span>
          {activePowerUp && POWER_UPS[activePowerUp] && (
            <span style={{ background: '#FBBF24', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', color: '#000' }}>
              {POWER_UPS[activePowerUp].emoji} {powerUpTimer}s
            </span>
          )}
          <button onClick={() => setShowPowerUpMenu(!showPowerUpMenu)} style={{ background: '#7C3AED', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>
            ⚡
          </button>
          <button onClick={() => setGameState('paused')} style={{ background: '#EF4444', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>
            ⏸️
          </button>
        </div>
      </div>

      {showPowerUpMenu && (
        <div style={{ position: 'absolute', top: '60px', right: '10px', zIndex: 100, background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: '200px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚡ Power-Ups</h4>
          {Object.entries(POWER_UPS).map(([key, pu]) => (
            <button
              key={key}
              onClick={() => { activatePowerUp(key); setShowPowerUpMenu(false); }}
              disabled={coins < pu.cost || activePowerUp === key}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', marginBottom: '4px', borderRadius: '8px', border: '1px solid #ddd', background: coins >= pu.cost ? '#F5F3FF' : '#f5f5f5', cursor: coins >= pu.cost ? 'pointer' : 'not-allowed', opacity: coins >= pu.cost ? 1 : 0.5 }}
            >
              <span style={{ fontSize: '20px' }}>{pu.emoji}</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{pu.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {pu.instant ? 'Instant' : pu.duration ? `${pu.duration / 1000}s` : ''} • 🪙{pu.cost}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ height: '450px', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '3px solid #7C3AED' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, fontSize: `${Math.random() * 10 + 6}px`, color: 'white', opacity: 0.5 }}>✦</div>
        ))}

        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => {
              const userAnswer = prompt(`Berapa ${card.question}?`);
              if (userAnswer !== null) {
                const answer = parseInt(userAnswer);
                if (!isNaN(answer)) {
                  const rect = gameAreaRef.current?.getBoundingClientRect();
                  const x = rect ? (card.x / 100) * rect.width : 200;
                  const y = rect ? (card.y / 100) * rect.height : 300;
                  handleAnswer(answer, card.id, x, y);
                }
              }
            }}
            style={{ position: 'absolute', left: `${card.x}%`, top: `${card.y}%`, background: 'linear-gradient(135deg, #FFD700, #FFA500)', padding: '12px 20px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,215,0,0.3)', zIndex: 10, transition: 'transform 0.1s', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; }}
          >
            {card.emoji} {card.question} = ?
          </div>
        ))}

        <div style={{ position: 'absolute', bottom: '10%', left: '5%', right: '5%', height: '2px', background: 'linear-gradient(90deg, transparent, #EF4444, transparent)' }}>
          <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', color: '#EF4444', fontSize: '12px' }}>⚠️ Jangan sampai jatuh!</span>
        </div>

        {floatingTexts.map(ft => (
          <div key={ft.id} style={{ position: 'absolute', left: ft.x, top: ft.y, color: ft.color, fontWeight: 'bold', fontSize: '20px', animation: 'floatUp 1s ease-out forwards', pointerEvents: 'none', zIndex: 50 }}>{ft.text}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>Klik kartu atau ketik jawaban:</span>
        <input ref={inputRef} type="number" onKeyDown={handleInputSubmit} placeholder="Jawaban..." style={{ padding: '8px 16px', fontSize: '18px', borderRadius: '12px', border: '2px solid #7C3AED', width: '120px', textAlign: 'center' }} autoFocus />
      </div>

      {gameState === 'paused' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>⏸️ Game Dihentikan</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setGameState('playing')} style={{ padding: '10px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>▶️ Lanjutkan</button>
              <button onClick={() => setGameState('menu')} style={{ padding: '10px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Menu</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-50px); } }`}</style>
    </div>
  );
}