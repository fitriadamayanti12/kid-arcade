// components/games/NumberNinja.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NumberNinjaProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Challenge {
  id: number;
  type: 'pattern' | 'missing' | 'balance' | 'comparison';
  question: string;
  visual: number[];
  answer: number;
  options: number[];
  explanation: string;
  points: number;
  timeLimit: number;
}

type GameMode = 'zen' | 'speed' | 'survival';
type Difficulty = 'easy' | 'medium' | 'hard';

const NINJA_RANKS = ['🥷 Pemula', '🎯 Pelatih', '⚔️ Prajurit', '🗡️ Ahli', '👑 Master Ninja'];

export default function NumberNinja({ onComplete }: NumberNinjaProps) {
  const [gameMode, setGameMode] = useState<GameMode>('zen');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'complete'>('menu');
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [ninjaRank, setNinjaRank] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const generateChallenge = useCallback((diff: Difficulty): Challenge => {
    const types: Challenge['type'][] = ['pattern', 'missing', 'balance', 'comparison'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let challenge: Challenge;
    
    switch (type) {
      case 'pattern': {
        // Pola bilangan: 2, 4, 6, ?, 10
        const patterns = [
          { sequence: [2, 4, 6, 8, 10], answer: 8, hint: '+2 setiap langkah' },
          { sequence: [3, 6, 9, 12, 15], answer: 12, hint: '+3 setiap langkah' },
          { sequence: [5, 10, 15, 20, 25], answer: 20, hint: '+5 setiap langkah' },
          { sequence: [1, 3, 5, 7, 9], answer: 7, hint: '+2 bilangan ganjil' },
          { sequence: [2, 6, 10, 14, 18], answer: 14, hint: '+4 setiap langkah' },
          { sequence: [10, 20, 30, 40, 50], answer: 40, hint: '+10 setiap langkah' },
          { sequence: [1, 2, 4, 8, 16], answer: 8, hint: '×2 setiap langkah' },
          { sequence: [3, 9, 27, 81, 243], answer: 81, hint: '×3 setiap langkah' },
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const missingIndex = 3; // Index yang hilang
        
        challenge = {
          id: Date.now(),
          type: 'pattern',
          question: '🔢 Temukan angka yang hilang dalam pola!',
          visual: pattern.sequence.map((n, i) => i === missingIndex ? -1 : n),
          answer: pattern.answer,
          options: generateOptions(pattern.answer, pattern.sequence),
          explanation: pattern.hint,
          points: 15,
          timeLimit: diff === 'easy' ? 20 : diff === 'medium' ? 15 : 10,
        };
        break;
      }
      
      case 'missing': {
        // Mencari angka hilang dalam operasi
        const operations = [
          { equation: (n: number) => `${n} + ? = ${n + 5}`, answer: 5, hint: 'Kurangkan hasil dengan angka pertama' },
          { equation: (n: number) => `? + ${n} = ${n + 7}`, answer: 7, hint: 'Kurangkan hasil dengan angka kedua' },
          { equation: (n: number) => `${n + 3} - ? = ${n}`, answer: 3, hint: 'Kurangkan angka besar dengan kecil' },
          { equation: (n: number) => `? × ${n} = ${n * 4}`, answer: 4, hint: 'Bagi hasil dengan angka yang diketahui' },
        ];
        
        const op = operations[Math.floor(Math.random() * operations.length)];
        const baseNum = Math.floor(Math.random() * 10) + 1;
        const eqString = op.equation(baseNum);
        
        challenge = {
          id: Date.now(),
          type: 'missing',
          question: `🔍 Cari angka yang hilang: ${eqString}`,
          visual: [],
          answer: op.answer,
          options: generateOptions(op.answer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
          explanation: op.hint,
          points: 20,
          timeLimit: diff === 'easy' ? 25 : diff === 'medium' ? 20 : 15,
        };
        break;
      }
      
      case 'balance': {
        // Menyeimbangkan timbangan
        const leftNum = Math.floor(Math.random() * 20) + 10;
        const rightNum = Math.floor(Math.random() * 15) + 5;
        const answer = leftNum - rightNum;
        
        challenge = {
          id: Date.now(),
          type: 'balance',
          question: `⚖️ Timbangan kiri = ${leftNum}, kanan = ${rightNum}. Berapa yang harus ditambah ke kanan agar seimbang?`,
          visual: [leftNum, rightNum],
          answer: answer,
          options: generateOptions(answer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]),
          explanation: `${leftNum} - ${rightNum} = ${answer}. Tambah ${answer} ke sisi kanan.`,
          points: 25,
          timeLimit: diff === 'easy' ? 30 : diff === 'medium' ? 20 : 15,
        };
        break;
      }
      
      case 'comparison': {
        // Membandingkan nilai
        const pairs = [
          { expr1: '3 × 4', expr2: '2 × 6', answer: 0, symbol: '=', hint: 'Keduanya = 12' },
          { expr1: '5 + 8', expr2: '7 + 5', answer: 1, symbol: '>', hint: '13 > 12' },
          { expr1: '20 - 7', expr2: '30 - 18', answer: 1, symbol: '>', hint: '13 > 12' },
          { expr1: '4 × 5', expr2: '10 + 10', answer: 0, symbol: '=', hint: 'Keduanya = 20' },
          { expr1: '100 ÷ 4', expr2: '5 × 5', answer: 0, symbol: '=', hint: 'Keduanya = 25' },
        ];
        
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        
        challenge = {
          id: Date.now(),
          type: 'comparison',
          question: `📊 Mana yang benar? ${pair.expr1} ... ${pair.expr2}`,
          visual: [],
          answer: pair.answer, // 0 = sama, 1 = lebih besar, -1 = lebih kecil
          options: [0, 1, -1],
          explanation: pair.hint,
          points: 15,
          timeLimit: diff === 'easy' ? 25 : diff === 'medium' ? 20 : 15,
        };
        break;
      }
    }
    
    return challenge;
  }, []);

  const generateOptions = (correct: number, pool: number[]): number[] => {
    const options = new Set<number>([correct]);
    while (options.size < 4) {
      const randomNum = pool[Math.floor(Math.random() * pool.length)];
      if (randomNum !== correct && randomNum > 0) {
        options.add(randomNum);
      }
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(mode === 'survival' ? 5 : 3);
    setChallengeIndex(0);
    setTotalChallenges(0);
    setCorrectAnswers(0);
    setComboMultiplier(1);
    setNinjaRank(0);
    setGameState('playing');
    
    const challenge = generateChallenge(difficulty);
    setCurrentChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
  }, [difficulty, generateChallenge]);

  const handleAnswer = useCallback((answer: number) => {
    if (!currentChallenge || showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentChallenge.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setTotalChallenges(prev => prev + 1);
    
    if (correct) {
      const pointsEarned = currentChallenge.points * comboMultiplier;
      setScore(prev => prev + pointsEarned);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        
        // Update combo multiplier
        if (newStreak >= 10) setComboMultiplier(4);
        else if (newStreak >= 7) setComboMultiplier(3);
        else if (newStreak >= 4) setComboMultiplier(2);
        else setComboMultiplier(1);
        
        // Update ninja rank
        if (newStreak >= 20) setNinjaRank(4);
        else if (newStreak >= 15) setNinjaRank(3);
        else if (newStreak >= 10) setNinjaRank(2);
        else if (newStreak >= 5) setNinjaRank(1);
        
        return newStreak;
      });
      
      // Spawn particles
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newParticles = Array.from({ length: 5 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          emoji: ['✨', '💫', '⭐', '🌟', '💥'][i],
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
      }
    } else {
      setStreak(0);
      setComboMultiplier(1);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => endGame(), 2000);
          return 0;
        }
        return newLives;
      });
    }
    
    setTimeout(() => {
      if (gameState === 'playing') {
        const newChallenge = generateChallenge(difficulty);
        setCurrentChallenge(newChallenge);
        setTimeLeft(newChallenge.timeLimit);
        setChallengeIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowExplanation(false);
      }
    }, 1500);
  }, [currentChallenge, showFeedback, comboMultiplier, gameState, difficulty, generateChallenge]);

  const endGame = useCallback(() => {
    setGameState('complete');
    if (timerRef.current) clearInterval(timerRef.current);
    
    const stars = correctAnswers >= 20 ? 3 : correctAnswers >= 10 ? 2 : 1;
    onComplete(stars, { 
      score, 
      correctAnswers, 
      totalChallenges, 
      bestStreak, 
      ninjaRank: NINJA_RANKS[ninjaRank] 
    });
  }, [score, correctAnswers, totalChallenges, bestStreak, ninjaRank, onComplete]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(-1); // Time's up, wrong answer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft, handleAnswer]);

  const renderPattern = (visual: number[]) => {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 my-6">
        {visual.map((num, idx) => (
          <div key={idx} className="relative">
            {num === -1 ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white animate-pulse border-2 border-yellow-600">
                ?
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg">
                {num}
              </div>
            )}
            {idx < visual.length - 1 && (
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xl">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBalance = (visual: number[]) => {
    const [left, right] = visual;
    const diff = left - right;
    const leftHeight = Math.min(100, left * 3);
    const rightHeight = Math.min(100, right * 3);
    
    return (
      <div className="flex items-end justify-center gap-8 my-6 h-32">
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold mb-1">{left}</div>
          <div 
            className="w-16 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-500"
            style={{ height: `${leftHeight}px` }}
          ></div>
          <div className="w-32 h-2 bg-gray-400 rounded-full mt-1"></div>
        </div>
        
        <div className="text-4xl self-center mb-8">
          {diff > 0 ? '>' : diff < 0 ? '<' : '='}
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold mb-1">{right}</div>
          <div 
            className="w-16 bg-gradient-to-t from-red-500 to-red-300 rounded-t-lg transition-all duration-500"
            style={{ height: `${rightHeight}px` }}
          ></div>
          <div className="w-32 h-2 bg-gray-400 rounded-full mt-1"></div>
        </div>
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-bounce">🥷</div>
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Number Ninja!</h2>
        <p className="text-gray-600 mb-6">Latih kecepatan & ketepatan matematika!</p>
        
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow">
            <h3 className="font-bold mb-2">🎯 Pilih Mode:</h3>
            <div className="space-y-2">
              <button
                onClick={() => startGame('zen')}
                className="w-full p-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold hover:scale-105 transition"
              >
                🧘 Zen Mode (Santai, tanpa timer)
              </button>
              <button
                onClick={() => startGame('speed')}
                className="w-full p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold hover:scale-105 transition"
              >
                ⚡ Speed Mode (Cepat & tepat!)
              </button>
              <button
                onClick={() => startGame('survival')}
                className="w-full p-3 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-xl font-bold hover:scale-105 transition"
              >
                💀 Survival Mode (5 nyawa, bertahan!)
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow">
            <h3 className="font-bold mb-2">📊 Kesulitan:</h3>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 p-2 rounded-xl font-bold transition ${
                    difficulty === d
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? '⭐' : d === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const stars = correctAnswers >= 20 ? 3 : correctAnswers >= 10 ? 2 : 1;
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{NINJA_RANKS[ninjaRank].split(' ')[0]}</div>
        <h2 className="text-2xl font-bold mb-2">Permainan Selesai!</h2>
        <p className="text-lg mb-1">Rank: {NINJA_RANKS[ninjaRank]}</p>
        <p className="text-gray-600 mb-1">Skor: {score}</p>
        <p className="text-gray-600 mb-1">Benar: {correctAnswers}/{totalChallenges}</p>
        <p className="text-gray-600 mb-2">Streak Terbaik: {bestStreak} 🔥</p>
        <div className="flex justify-center gap-2 text-4xl">
          {stars >= 1 && '⭐'}
          {stars >= 2 && '⭐'}
          {stars >= 3 && '⭐'}
        </div>
      </div>
    );
  }

  if (!currentChallenge) return null;

  return (
    <div ref={gameAreaRef} className="relative max-w-2xl mx-auto">
      {/* HUD */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow">
          <span className="text-xl">⭐</span>
          <span className="font-bold">{score}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {streak >= 4 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-bold animate-pulse text-sm">
              🔥 x{streak} ({comboMultiplier}x)
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
        </div>
      </div>
      
      {/* Ninja Rank */}
      <div className="text-center mb-2">
        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          {NINJA_RANKS[ninjaRank]}
        </span>
      </div>
      
      {/* Timer Bar */}
      {gameMode !== 'zen' && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeLeft > (currentChallenge.timeLimit / 2) ? 'bg-green-500' :
              timeLeft > (currentChallenge.timeLimit / 4) ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / currentChallenge.timeLimit) * 100}%` }}
          />
        </div>
      )}
      
      {/* Challenge Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="text-center mb-4">
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-2 inline-block">
            {currentChallenge.type === 'pattern' && '🔢 Pola Bilangan'}
            {currentChallenge.type === 'missing' && '🔍 Angka Hilang'}
            {currentChallenge.type === 'balance' && '⚖️ Timbangan'}
            {currentChallenge.type === 'comparison' && '📊 Perbandingan'}
          </span>
          <h3 className="text-lg font-bold mt-2">{currentChallenge.question}</h3>
          <span className="text-sm text-gray-500">+{currentChallenge.points * comboMultiplier} poin</span>
        </div>
        
        {/* Visual */}
        {currentChallenge.type === 'pattern' && renderPattern(currentChallenge.visual)}
        {currentChallenge.type === 'balance' && renderBalance(currentChallenge.visual)}
        
        {/* Comparison Visual */}
        {currentChallenge.type === 'comparison' && (
          <div className="flex justify-center items-center gap-4 my-6">
            <div className="bg-blue-100 rounded-xl p-4 text-xl font-bold">?</div>
            <div className="text-3xl font-bold">?</div>
            <div className="bg-red-100 rounded-xl p-4 text-xl font-bold">?</div>
          </div>
        )}
        
        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentChallenge.type === 'comparison' ? (
            <>
              <button
                onClick={() => handleAnswer(1)}
                disabled={showFeedback}
                className={`p-4 rounded-xl text-2xl font-bold transition ${
                  showFeedback && 1 === currentChallenge.answer
                    ? 'bg-green-500 text-white'
                    : showFeedback && selectedAnswer === 1
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 hover:bg-blue-100'
                }`}
              >
                {'>'}
              </button>
              <button
                onClick={() => handleAnswer(0)}
                disabled={showFeedback}
                className={`p-4 rounded-xl text-2xl font-bold transition ${
                  showFeedback && 0 === currentChallenge.answer
                    ? 'bg-green-500 text-white'
                    : showFeedback && selectedAnswer === 0
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 hover:bg-blue-100'
                }`}
              >
                {'='}
              </button>
              <button
                onClick={() => handleAnswer(-1)}
                disabled={showFeedback}
                className={`p-4 rounded-xl text-2xl font-bold transition col-span-2 ${
                  showFeedback && -1 === currentChallenge.answer
                    ? 'bg-green-500 text-white'
                    : showFeedback && selectedAnswer === -1
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 hover:bg-blue-100'
                }`}
              >
                {'<'}
              </button>
            </>
          ) : (
            currentChallenge.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                className={`p-4 rounded-xl text-xl font-bold transition transform hover:scale-105 ${
                  showFeedback && option === currentChallenge.answer
                    ? 'bg-green-500 text-white scale-110'
                    : showFeedback && option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400 text-white hover:shadow-lg'
                }`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Feedback */}
      {showFeedback && (
        <div className={`text-center p-4 rounded-xl ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div className="text-3xl mb-2">
            {isCorrect ? '🎉' : '😢'}
          </div>
          <p className={`text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? `+${currentChallenge.points * comboMultiplier} Poin!` : 'Salah!'}
          </p>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-sm text-blue-500 underline mt-2"
          >
            {showExplanation ? 'Sembunyikan' : 'Lihat Penjelasan'}
          </button>
          {showExplanation && (
            <p className="text-sm text-gray-600 mt-2">{currentChallenge.explanation}</p>
          )}
        </div>
      )}
      
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-2xl pointer-events-none animate-ping"
          style={{ left: particle.x, top: particle.y }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}