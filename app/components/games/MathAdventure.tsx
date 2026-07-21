'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MathAdventureProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Obstacle {
  id: number;
  x: number;
  question: string;
  answer: number;
  options: number[];
  passed: boolean;
}

interface PowerUp {
  id: number;
  x: number;
  type: 'shield' | 'speed' | 'double';
  collected: boolean;
}

type GameState = 'ready' | 'playing' | 'answering' | 'complete';

const CHARACTERS = ['🦸', '🦹', '🧙', '🦊', '🐱', '🐶', '🦄', '🤖'];
const POWER_UPS = {
  shield: { emoji: '🛡️', name: 'Perisai', color: 'bg-blue-400' },
  speed: { emoji: '⚡', name: 'Kecepatan', color: 'bg-yellow-400' },
  double: { emoji: '✨', name: 'Skor 2x', color: 'bg-purple-400' },
};

export default function MathAdventure({ onComplete }: MathAdventureProps) {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [currentObstacle, setCurrentObstacle] = useState<Obstacle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [collectedPowerUps, setCollectedPowerUps] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [characterY, setCharacterY] = useState(50);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback((level: number) => {
    const operations = level === 1 ? ['+', '-'] : 
                      level === 2 ? ['+', '-', '×'] : 
                      ['+', '-', '×', '÷'];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, answer: number, question: string;
    
    const maxNum = level === 1 ? 20 : level === 2 ? 50 : 100;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * maxNum) + Math.floor(maxNum/2);
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * (level + 4)) + 1;
        num2 = Math.floor(Math.random() * (level + 4)) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2} = ?`;
        break;
      default:
        answer = 0;
        question = '';
    }
    
    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * Math.max(10, answer/2)) + 1;
      options.add(Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset));
    }
    
    return {
      question,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  }, []);

  const endGame = useCallback(() => {
    setGameState('complete');
    if (timeRef.current) clearInterval(timeRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    const stars = score >= 200 ? 3 : score >= 100 ? 2 : 1;
    onComplete(stars, { score, level });
  }, [score, level, onComplete]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    setTimeLeft(30);
    setObstacles([]);
    setPowerUps([]);
    setCollectedPowerUps([]);
    
    const initialObstacles: Obstacle[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 100 + i * 150,
      ...generateQuestion(1),
      passed: false,
    }));
    setObstacles(initialObstacles);
    
    const initialPowerUps: PowerUp[] = [
      { id: 1, x: 250, type: 'shield', collected: false },
      { id: 2, x: 500, type: 'double', collected: false },
      { id: 3, x: 700, type: 'speed', collected: false },
    ];
    setPowerUps(initialPowerUps);
    
    if (timeRef.current) clearInterval(timeRef.current);
    timeRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setTimeout(() => endGame(), 100);
              return 0;
            }
            return newLives;
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generateQuestion, endGame]);

  const handleAnswer = useCallback((answer: number) => {
    if (!currentObstacle) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentObstacle.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const bonusPoints = collectedPowerUps.includes('double') ? 20 : 10;
      const comboBonus = combo * 5;
      setScore(prev => prev + bonusPoints + comboBonus);
      setCombo(prev => prev + 1);
      
      setObstacles(prev => prev.map(o => 
        o.id === currentObstacle.id ? { ...o, passed: true } : o
      ));
      
      powerUps.forEach(pu => {
        if (Math.abs(pu.x - currentObstacle.x) < 50 && !pu.collected) {
          setPowerUps(prev => prev.map(p => 
            p.id === pu.id ? { ...p, collected: true } : p
          ));
          setCollectedPowerUps(prev => [...prev, pu.type]);
          setTimeout(() => {
            setCollectedPowerUps(prev => prev.filter(t => t !== pu.type));
          }, 5000);
        }
      });
      
      const passedCount = obstacles.filter(o => o.passed).length + 1;
      if (passedCount >= 4) {
        setLevel(prev => {
          const newLevel = prev + 1;
          const newObstacles: Obstacle[] = Array.from({ length: 5 }, (_, i) => ({
            id: Date.now() + i,
            x: 800 + i * 150,
            ...generateQuestion(newLevel),
            passed: false,
          }));
          setObstacles(prev => [...prev, ...newObstacles]);
          return newLevel;
        });
      }
    } else {
      setCombo(0);
      if (!collectedPowerUps.includes('shield')) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setTimeout(() => endGame(), 1500);
            return 0;
          }
          return newLives;
        });
      }
    }
    
    setTimeout(() => {
      setCurrentObstacle(null);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  }, [currentObstacle, combo, collectedPowerUps, powerUps, obstacles, generateQuestion, endGame]);

  const jump = useCallback(() => {
    setCharacterY(prev => {
      if (prev > 20) return prev - 30;
      return prev;
    });
    setTimeout(() => {
      setCharacterY(50);
    }, 300);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        setObstacles(prev => prev.map(o => ({
          ...o,
          x: o.x - 2,
        })));
        
        setPowerUps(prev => prev.map(p => ({
          ...p,
          x: p.x - 2,
        })));
      }, 50);
      
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const checkCollision = setInterval(() => {
        obstacles.forEach(obstacle => {
          if (!obstacle.passed && obstacle.x < 30 && obstacle.x > 10 && !currentObstacle) {
            setCurrentObstacle(obstacle);
          }
        });
      }, 100);
      
      return () => clearInterval(checkCollision);
    }
  }, [gameState, obstacles, currentObstacle]);

  useEffect(() => {
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  if (gameState === 'ready') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-bounce">🎮</div>
        <h2 className="text-3xl font-bold mb-2 text-purple-600">Math Adventure!</h2>
        <p className="text-gray-600 mb-4">Petualangan Seru dengan Matematika!</p>
        
        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
          <p className="font-bold mb-2">🎯 Cara Bermain:</p>
          <ul className="text-sm text-left space-y-2">
            <li>🏃‍♂️ Karaktermu berlari otomatis</li>
            <li>🧮 Jawab soal matematika untuk melewati rintangan</li>
            <li>🛡️ Kumpulkan power-ups untuk bantuan</li>
            <li>⚡ Jawab cepat dapat kombo bonus!</li>
            <li>❤️ Kamu punya 3 nyawa</li>
          </ul>
        </div>
        
        <div className="flex justify-center gap-4 mb-6">
          {CHARACTERS.slice(0, 4).map((char, idx) => (
            <button
              key={idx}
              onClick={() => setCharacter(char)}
              className={`text-4xl p-3 rounded-xl transition-all ${
                character === char ? 'bg-purple-200 scale-110 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
        
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition"
        >
          🚀 Mulai Petualangan!
        </button>
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2 text-purple-600">Petualangan Selesai!</h2>
        <p className="text-lg mb-2">Skor: {score}</p>
        <p className="text-gray-600 mb-2">Level Dicapai: {level}</p>
        <div className="flex justify-center gap-2 text-4xl">
          {score >= 200 ? '⭐⭐⭐' : score >= 100 ? '⭐⭐' : '⭐'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] bg-gradient-to-b from-blue-200 to-green-200 rounded-2xl overflow-hidden">
      {/* Sky */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300 to-blue-100">
        <div className="absolute top-10 left-10 text-4xl opacity-70">☁️</div>
        <div className="absolute top-20 right-20 text-3xl opacity-70">☁️</div>
        <div className="absolute top-5 left-1/2 text-5xl opacity-70">☁️</div>
      </div>
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-green-300 to-green-600">
        <div className="absolute top-0 left-0 right-0 h-2 bg-green-400"></div>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="absolute bottom-20 text-2xl" style={{ left: `${i * 5}%` }}>
            🌿
          </div>
        ))}
      </div>
      
      {/* Character */}
      <div 
        className="absolute transition-all duration-300"
        style={{ 
          left: '20%', 
          top: `${characterY}%`,
          transform: 'translateY(-50%)'
        }}
      >
        <div className="text-5xl animate-bounce">{character}</div>
        {collectedPowerUps.includes('shield') && (
          <div className="absolute -top-2 -left-2 text-2xl">🛡️</div>
        )}
        {collectedPowerUps.includes('speed') && (
          <div className="absolute -top-2 -right-2 text-2xl">⚡</div>
        )}
        {collectedPowerUps.includes('double') && (
          <div className="absolute -bottom-2 left-1/2 text-2xl">✨</div>
        )}
      </div>
      
      {/* Obstacles */}
      {obstacles.filter(o => !o.passed).map(obstacle => (
        <div
          key={obstacle.id}
          className="absolute top-[55%] transition-all duration-50"
          style={{ left: `${obstacle.x}px` }}
        >
          <div className="text-4xl animate-pulse">🧱</div>
          {currentObstacle?.id === obstacle.id && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-2 shadow-lg text-sm font-bold min-w-[120px]">
              {obstacle.question}
            </div>
          )}
        </div>
      ))}
      
      {/* Power-ups */}
      {powerUps.filter(p => !p.collected).map(powerUp => (
        <div
          key={powerUp.id}
          className="absolute top-[45%] transition-all duration-50"
          style={{ left: `${powerUp.x}px` }}
        >
          <div className="text-3xl animate-bounce">
            {POWER_UPS[powerUp.type].emoji}
          </div>
        </div>
      ))}
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2">
          <span className="text-xl">❤️</span>
          <span className="font-bold">{lives}</span>
        </div>
        <div className="bg-white/90 rounded-full px-4 py-2 font-bold">
          Level {level}
        </div>
        <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2">
          <span className="text-xl">⭐</span>
          <span className="font-bold">{score}</span>
        </div>
        <div className={`bg-white/90 rounded-full px-4 py-2 font-bold ${
          timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''
        }`}>
          ⏱️ {timeLeft}s
        </div>
      </div>
      
      {/* Combo Display */}
      {combo >= 3 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 text-white px-4 py-2 rounded-full font-bold animate-bounce text-lg">
            🔥 Combo x{combo}!
          </div>
        </div>
      )}
      
      {/* Answer Modal */}
      {currentObstacle && !showFeedback && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-2xl p-4 shadow-2xl w-[90%] max-w-md">
          <p className="text-center font-bold text-lg mb-3">{currentObstacle.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {currentObstacle.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-xl font-bold hover:scale-105 transition"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Feedback */}
      {showFeedback && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-5xl mb-2">
            {isCorrect ? '🎉' : '💥'}
          </div>
          <div className={`text-xl font-bold ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? `+${collectedPowerUps.includes('double') ? '20' : '10'} Poin!` : 'Salah!'}
          </div>
          {isCorrect && combo >= 2 && (
            <div className="text-yellow-600 font-bold">
              Kombo Bonus: +{combo * 5}!
            </div>
          )}
        </div>
      )}
      
      {/* Mobile Controls */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={jump}
          className="bg-white/90 rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition active:scale-95"
        >
          ⬆️
        </button>
      </div>
    </div>
  );
}