// app/components/games/DiceQuest.tsx
'use client';

import { useState, useCallback } from 'react';

interface DiceQuestProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface BoardCell {
  id: number;
  type: 'normal' | 'treasure' | 'challenge' | 'start' | 'finish';
  emoji: string;
  points: number;
}

const BOARD: BoardCell[] = [
  { id: 0, type: 'start', emoji: '🚀', points: 0 },
  { id: 1, type: 'normal', emoji: '🌳', points: 5 },
  { id: 2, type: 'challenge', emoji: '⚔️', points: 15 },
  { id: 3, type: 'normal', emoji: '🏔️', points: 5 },
  { id: 4, type: 'treasure', emoji: '💎', points: 20 },
  { id: 5, type: 'normal', emoji: '🌊', points: 5 },
  { id: 6, type: 'challenge', emoji: '🐉', points: 15 },
  { id: 7, type: 'normal', emoji: '🏕️', points: 5 },
  { id: 8, type: 'treasure', emoji: '👑', points: 25 },
  { id: 9, type: 'normal', emoji: '🌋', points: 5 },
  { id: 10, type: 'challenge', emoji: '🧙', points: 15 },
  { id: 11, type: 'normal', emoji: '🏯', points: 5 },
  { id: 12, type: 'treasure', emoji: '🏆', points: 30 },
  { id: 13, type: 'normal', emoji: '🌈', points: 5 },
  { id: 14, type: 'finish', emoji: '🎉', points: 50 },
];

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceQuest({ onComplete }: DiceQuestProps) {
  const [position, setPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; ans: number; opts: number[] } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [treasures, setTreasures] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);

  const generateQuestion = useCallback(() => {
    const types = [
      // Penjumlahan
      () => {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        return { q: `${a} + ${b} = ?`, ans: a + b };
      },
      // Pengurangan
      () => {
        const a = Math.floor(Math.random() * 30) + 10;
        const b = Math.floor(Math.random() * a) + 1;
        return { q: `${a} - ${b} = ?`, ans: a - b };
      },
      // Perkalian
      () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        return { q: `${a} × ${b} = ?`, ans: a * b };
      },
      // Pola
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 5) + 1;
        return { q: `${start}, ${start + step}, ${start + step * 2}, ?`, ans: start + step * 3 };
      },
    ];
    
    const gen = types[Math.floor(Math.random() * types.length)]();
    const opts = new Set([gen.ans]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 10) + 1;
      opts.add(Math.random() > 0.5 ? gen.ans + offset : Math.max(0, gen.ans - offset));
    }
    
    return { ...gen, opts: Array.from(opts).sort(() => Math.random() - 0.5) };
  }, []);

  const rollDice = () => {
    if (isRolling || gameOver) return;
    
    setIsRolling(true);
    setFeedback(null);
    
    // Animasi dadu bergulir
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 8) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        
        // Tampilkan soal
        setCurrentQuestion(generateQuestion());
        setShowQuestion(true);
      }
    }, 100);
  };

  const handleAnswer = (ans: number) => {
    if (!currentQuestion) return;
    
    const correct = ans === currentQuestion.ans;
    setFeedback(correct ? 'correct' : 'wrong');
    setShowQuestion(false);
    
    if (correct) {
      setCombo(c => c + 1);
      const newPos = Math.min(position + (diceValue || 1), BOARD.length - 1);
      setPosition(newPos);
      setMoves(m => m + 1);
      
      const cell = BOARD[newPos];
      const comboBonus = combo >= 3 ? combo * 2 : 0;
      const points = cell.points + comboBonus;
      setScore(s => s + points);
      
      if (cell.type === 'treasure') {
        setTreasures(t => [...t, cell.emoji]);
      }
      
      if (cell.type === 'finish') {
        setTimeout(() => setGameOver(true), 1000);
      }
    } else {
      setCombo(0);
      // Mundur 1 langkah jika salah
      setPosition(p => Math.max(0, p - 1));
    }
    
    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(null);
    }, 1500);
  };

  const handleComplete = () => {
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
    onComplete(stars, { score, treasures: treasures.length, moves });
  };

  if (gameOver) {
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '28px', color: '#7C3AED' }}>Petualangan Selesai!</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '40px', margin: '16px 0' }}>
          {treasures.map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <p style={{ fontSize: '18px' }}>Skor: {score} | Harta: {treasures.length}</p>
        <p style={{ fontSize: '18px', color: '#666' }}>Langkah: {moves}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{
          marginTop: '16px', padding: '12px 32px', background: '#7C3AED', color: 'white',
          border: 'none', borderRadius: '999px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          🎉 Klaim Hadiah
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
        <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}>
          ⭐ {score}
        </div>
        <div style={{ background: '#FEE2E2', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}>
          🎯 Langkah: {moves}
        </div>
        <div style={{ background: '#E0E7FF', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}>
          🔥 Combo: {combo}
        </div>
        <div style={{ background: '#D1FAE5', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}>
          💎 {treasures.length}
        </div>
      </div>

      {/* Papan Permainan */}
      <div style={{ 
        background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        minHeight: '300px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {BOARD.map((cell, idx) => {
            const isPlayer = position === idx;
            const isPast = position > idx;
            
            return (
              <div key={idx} style={{
                aspectRatio: '1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                background: isPlayer ? '#FBBF24' : isPast ? '#10B981' : 'rgba(255,255,255,0.2)',
                border: isPlayer ? '3px solid #F59E0B' : '2px solid rgba(255,255,255,0.3)',
                position: 'relative',
                transition: 'all 0.3s',
                transform: isPlayer ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isPlayer ? '0 0 20px rgba(251,191,36,0.5)' : 'none',
              }}>
                {cell.emoji}
                {isPlayer && (
                  <div style={{
                    position: 'absolute', top: '-25px', fontSize: '35px',
                    animation: 'bounce 0.5s infinite'
                  }}>
                    🧑
                  </div>
                )}
                {cell.type === 'treasure' && !isPast && !isPlayer && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '-5px',
                    fontSize: '12px', background: '#FBBF24', borderRadius: '50%',
                    width: '20px', height: '20px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    ⭐
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dadu & Soal */}
      <div style={{ textAlign: 'center' }}>
        {!showQuestion && !feedback && (
          <button
            onClick={rollDice}
            disabled={isRolling}
            style={{
              padding: '20px 40px',
              fontSize: '50px',
              background: isRolling ? '#D1D5DB' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
              border: 'none',
              borderRadius: '20px',
              cursor: isRolling ? 'default' : 'pointer',
              transition: 'all 0.2s',
              transform: isRolling ? 'scale(1)' : 'scale(1.05)',
              boxShadow: '0 4px 15px rgba(245,158,11,0.4)',
            }}
          >
            {diceValue ? DICE_FACES[diceValue - 1] : '🎲'}
            <div style={{ fontSize: '14px', color: 'white', marginTop: '4px' }}>
              {isRolling ? 'Mengocok...' : 'Lempar Dadu!'}
            </div>
          </button>
        )}

        {/* Soal */}
        {showQuestion && currentQuestion && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '8px' }}>
              {diceValue ? DICE_FACES[diceValue - 1] : '🎲'} → Maju {diceValue} langkah!
            </div>
            <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>{currentQuestion.q}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {currentQuestion.opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  style={{
                    padding: '14px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '2px solid #7C3AED',
                    background: 'white',
                    color: '#7C3AED',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#7C3AED'; }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            padding: '20px',
            borderRadius: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: feedback === 'correct' ? '#D1FAE5' : '#FEE2E2',
            color: feedback === 'correct' ? '#065F46' : '#991B1B',
            animation: 'bounce 0.5s',
            marginTop: '16px'
          }}>
            {feedback === 'correct' ? '🎉 Benar! Maju!' : '😢 Salah! Mundur...'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}