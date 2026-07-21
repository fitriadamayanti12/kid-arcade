// app/components/games/MathTower.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface MathTowerProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Enemy {
  id: number;
  hp: number;
  maxHp: number;
  x: number;
  speed: number;
  emoji: string;
  question: { q: string; ans: number };
  damage: number;
}

interface Tower {
  level: number;
  damage: number;
  emoji: string;
}

export default function MathTower({ onComplete }: MathTowerProps) {
  const [tower, setTower] = useState<Tower>({ level: 1, damage: 10, emoji: '🏰' });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(5);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [waveComplete, setWaveComplete] = useState(false);
  const [totalKills, setTotalKills] = useState(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  const ENEMY_TYPES = [
    { emoji: '🐗', hp: 20, speed: 0.5, damage: 1 },
    { emoji: '🐺', hp: 30, speed: 0.8, damage: 1 },
    { emoji: '🐻', hp: 50, speed: 0.4, damage: 2 },
    { emoji: '🐉', hp: 80, speed: 0.3, damage: 3 },
    { emoji: '👹', hp: 100, speed: 0.2, damage: 5 },
  ];

  const generateQuestion = (difficulty: number) => {
    const types = [
      () => { const a = Math.floor(Math.random() * 20 * difficulty) + 1; const b = Math.floor(Math.random() * 15 * difficulty) + 1; return { q: `${a} + ${b} = ?`, ans: a + b }; },
      () => { const a = Math.floor(Math.random() * 30 * difficulty) + 20; const b = Math.floor(Math.random() * a) + 1; return { q: `${a} - ${b} = ?`, ans: a - b }; },
      () => { const a = Math.floor(Math.random() * 12) + 1; const b = Math.floor(Math.random() * 12) + 1; return { q: `${a} × ${b} = ?`, ans: a * b }; },
      () => { const b = Math.floor(Math.random() * 9) + 1; const ans = Math.floor(Math.random() * 9) + 1; const a = b * ans; return { q: `${a} ÷ ${b} = ?`, ans }; },
      () => { const num = Math.floor(Math.random() * 100) + 10; return { q: `${num} × 25% = ?`, ans: Math.round(num * 0.25) }; },
    ];
    return types[Math.floor(Math.random() * types.length)]();
  };

  const spawnEnemy = useCallback(() => {
    const type = ENEMY_TYPES[Math.min(wave - 1, ENEMY_TYPES.length - 1)];
    const hpMultiplier = 1 + (wave - 1) * 0.3;
    
    const newEnemy: Enemy = {
      id: Date.now(),
      hp: Math.round(type.hp * hpMultiplier),
      maxHp: Math.round(type.hp * hpMultiplier),
      x: 0,
      speed: type.speed,
      emoji: type.emoji,
      question: generateQuestion(wave),
      damage: type.damage,
    };
    
    setEnemies(prev => [...prev, newEnemy]);
  }, [wave]);

  const startWave = () => {
    setWaveComplete(false);
    const enemiesPerWave = 3 + wave;
    let spawned = 0;
    
    spawnRef.current = setInterval(() => {
      if (spawned < enemiesPerWave) {
        spawnEnemy();
        spawned++;
      } else {
        if (spawnRef.current) clearInterval(spawnRef.current);
      }
    }, 2000);
  };

  useEffect(() => {
    startWave();
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [wave]);

  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setEnemies(prev => {
        const updated = prev.map(e => {
          const newX = e.x + e.speed;
          
          // Enemy mencapai tower
          if (newX >= 85) {
            setLives(l => {
              const newLives = l - e.damage;
              if (newLives <= 0) {
                setGameOver(true);
                return 0;
              }
              return newLives;
            });
            return null; // Akan difilter
          }
          
          return { ...e, x: newX };
        }).filter(Boolean) as Enemy[];
        
        // Check wave complete
        if (updated.length === 0 && prev.length > 0) {
          setWaveComplete(true);
          setGold(g => g + 50 + wave * 10);
        }
        
        return updated;
      });
    }, 100);
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  const selectEnemy = (enemy: Enemy) => {
    if (feedback) return;
    setSelectedEnemy(enemy);
    setAnswer('');
    setFeedback(null);
  };

  const handleAttack = () => {
    if (!selectedEnemy || !answer) return;
    
    const correct = parseInt(answer) === selectedEnemy.question.ans;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const newHp = selectedEnemy.hp - tower.damage;
      
      if (newHp <= 0) {
        setEnemies(prev => prev.filter(e => e.id !== selectedEnemy.id));
        setScore(s => s + selectedEnemy.maxHp);
        setGold(g => g + 10);
        setTotalKills(k => k + 1);
        
        // Upgrade tower setiap 5 kill
        if ((totalKills + 1) % 5 === 0) {
          setTower(t => ({
            level: t.level + 1,
            damage: t.damage + 5,
            emoji: t.level >= 5 ? '🏯' : t.level >= 3 ? '🏛️' : '🏰',
          }));
        }
      } else {
        setEnemies(prev => prev.map(e => 
          e.id === selectedEnemy.id ? { ...e, hp: newHp } : e
        ));
      }
      
      setSelectedEnemy(null);
      setAnswer('');
    }
    
    setTimeout(() => setFeedback(null), 1000);
  };

  const upgradeTower = () => {
    const cost = tower.level * 30;
    if (gold >= cost) {
      setGold(g => g - cost);
      setTower(t => ({
        level: t.level + 1,
        damage: t.damage + 8,
        emoji: t.level >= 5 ? '🏯' : t.level >= 3 ? '🏛️' : '🏰',
      }));
    }
  };

  const nextWave = () => {
    setWave(w => w + 1);
  };

  const handleComplete = () => {
    const stars = wave >= 5 ? 3 : wave >= 3 ? 2 : 1;
    onComplete(stars, { score, wave, totalKills });
  };

  if (gameOver) {
    const stars = wave >= 5 ? 3 : wave >= 3 ? 2 : 1;
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '60px' }}>💔</div>
        <h2 style={{ fontSize: '28px', color: '#DC2626' }}>Menara Jatuh!</h2>
        <p style={{ fontSize: '18px' }}>Wave: {wave} | Kill: {totalKills}</p>
        <p style={{ fontSize: '18px' }}>Skor: {score}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{
          marginTop: '16px', padding: '12px 32px', background: '#DC2626', color: 'white',
          border: 'none', borderRadius: '999px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          🏆 Klaim Hadiah
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={hudStyle('❤️', lives)}>
          {Array.from({ length: lives }).map((_, i) => <span key={i}>❤️</span>)}
        </div>
        <div style={hudStyle('⭐', score)}>{score}</div>
        <div style={hudStyle('🪙', gold)}>{gold}</div>
        <div style={hudStyle('🌊', wave)}>Wave {wave}</div>
        <div style={hudStyle('💀', totalKills)}>{totalKills}</div>
      </div>

      {/* Arena */}
      <div style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 60%, #8B7355 100%)',
        borderRadius: '20px',
        height: '350px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '16px',
        border: '3px solid #5C4033',
      }}>
        {/* Path */}
        <div style={{
          position: 'absolute', top: '50%', left: '5%', right: '5%',
          height: '60px', background: '#8B7355', borderRadius: '30px',
          transform: 'translateY(-50%)', border: '2px solid #5C4033'
        }} />

        {/* Tower */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          fontSize: '50px', zIndex: 10,
        }}>
          {tower.emoji}
          <div style={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: '#FBBF24' }}>
            Lv.{tower.level} | 🗡️{tower.damage}
          </div>
        </div>

        {/* Enemies */}
        {enemies.map(enemy => (
          <button
            key={enemy.id}
            onClick={() => selectEnemy(enemy)}
            disabled={!!feedback}
            style={{
              position: 'absolute',
              left: `${5 + enemy.x}%`,
              top: `${40 + Math.random() * 10}%`,
              fontSize: '35px',
              cursor: 'pointer',
              transition: 'all 0.1s',
              transform: selectedEnemy?.id === enemy.id ? 'scale(1.2)' : 'scale(1)',
              filter: selectedEnemy?.id === enemy.id ? 'brightness(1.3)' : 'none',
              background: 'none',
              border: 'none',
              padding: '5px',
            }}
          >
            {enemy.emoji}
            {/* HP Bar */}
            <div style={{
              width: '40px', height: '4px', background: '#374151',
              borderRadius: '2px', margin: '0 auto',
            }}>
              <div style={{
                width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: '100%',
                background: enemy.hp > enemy.maxHp * 0.5 ? '#10B981' : '#EF4444',
                borderRadius: '2px',
              }} />
            </div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center' }}>
        {waveComplete ? (
          <div style={{ padding: '20px', background: '#D1FAE5', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '24px', color: '#065F46' }}>🎉 Wave {wave} Selesai!</h3>
            <p style={{ color: '#065F46' }}>+50 Gold Bonus!</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
              <button onClick={nextWave} style={actionBtn('#7C3AED')}>
                ⚔️ Wave {wave + 1}
              </button>
              <button onClick={upgradeTower} disabled={gold < tower.level * 30} style={{
                ...actionBtn('#F59E0B'),
                opacity: gold >= tower.level * 30 ? 1 : 0.5,
              }}>
                ⬆️ Upgrade ({tower.level * 30}🪙)
              </button>
            </div>
          </div>
        ) : selectedEnemy ? (
          <div style={{ padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {selectedEnemy.emoji} HP: {selectedEnemy.hp}/{selectedEnemy.maxHp}
            </p>
            <p style={{ fontSize: '20px', marginBottom: '12px' }}>{selectedEnemy.question.q}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <input
                type="number"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAttack()}
                placeholder="Jawaban..."
                style={{
                  padding: '10px 16px', fontSize: '18px', borderRadius: '12px',
                  border: '2px solid #7C3AED', width: '150px', textAlign: 'center'
                }}
                autoFocus
              />
              <button onClick={handleAttack} style={actionBtn('#EF4444')}>
                ⚔️ Serang!
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#666' }}>👆 Klik musuh untuk menyerang!</p>
        )}

        {feedback && (
          <div style={{
            marginTop: '12px', padding: '12px', borderRadius: '12px',
            fontSize: '20px', fontWeight: 'bold',
            background: feedback === 'correct' ? '#D1FAE5' : '#FEE2E2',
            color: feedback === 'correct' ? '#065F46' : '#991B1B',
          }}>
            {feedback === 'correct' ? '🎯 Tepat sasaran!' : '❌ Melenceng!'}
          </div>
        )}
      </div>
    </div>
  );
}

function hudStyle(icon: string, value: number | string) {
  return {
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };
}

function actionBtn(color: string) {
  return {
    padding: '10px 20px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };
}