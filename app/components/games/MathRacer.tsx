// components/games/MathRacer.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MathRacerProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Question {
  id: number;
  text: string;
  answer: number;
  options: number[];
  difficulty: number;
}

interface PlayerCar {
  x: number;
  speed: number;
  color: string;
  emoji: string;
}

interface AICar {
  x: number;
  speed: number;
  emoji: string;
  name: string;
}

const CAR_EMOJIS = ['🚗', '🚙', '🏎️', '🚓', '🚕', '🚐'];
const TRACK_LENGTH = 500;
const FINISH_LINE = 450;

const TRACK_OBSTACLES = [
  { x: 100, emoji: '🛑', type: 'stop' },
  { x: 200, emoji: '⚡', type: 'boost' },
  { x: 300, emoji: '💨', type: 'slow' },
  { x: 400, emoji: '⭐', type: 'star' },
];

export default function MathRacer({ onComplete }: MathRacerProps) {
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'racing' | 'question' | 'complete'>('menu');
  const [player, setPlayer] = useState<PlayerCar>({ x: 0, speed: 0, color: 'blue', emoji: '🚗' });
  const [aiCars, setAICars] = useState<AICar[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [lap, setLap] = useState(1);
  const [totalLaps, setTotalLaps] = useState(3);
  const [boostMeter, setBoostMeter] = useState(0);
  const [position, setPosition] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [raceTime, setRaceTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [showObstacle, setShowObstacle] = useState<string | null>(null);
  
  const raceLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback((difficulty: number): Question => {
    const operations = difficulty <= 1 ? ['+', '-'] :
                      difficulty === 2 ? ['+', '-', '×'] :
                      ['+', '-', '×', '÷'];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, answer: number, text: string;
    
    const maxNum = difficulty <= 1 ? 20 : difficulty === 2 ? 50 : 100;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        text = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * maxNum) + Math.floor(maxNum/2);
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        text = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 * num2;
        text = `${num1} × ${num2}`;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * answer;
        text = `${num1} ÷ ${num2}`;
        break;
      default:
        answer = 0;
        text = '';
    }
    
    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) + 1;
      options.add(Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset));
    }
    
    return {
      id: Date.now(),
      text,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      difficulty,
    };
  }, []);

  const startRace = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayer({ x: 0, speed: 0, color: 'blue', emoji: '🚗' });
    setAICars([
      { x: 0, speed: 0, emoji: '🏎️', name: 'Speedy' },
      { x: 0, speed: 0, emoji: '🚓', name: 'Policia' },
      { x: 0, speed: 0, emoji: '🚕', name: 'Taxi' },
    ]);
    setScore(0);
    setLap(1);
    setBoostMeter(0);
    setRaceTime(0);
    
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownInterval);
        setGameState('racing');
        startRaceLoop();
        startTimer();
      }
    }, 1000);
  }, []);

  const startRaceLoop = () => {
    if (raceLoopRef.current) clearInterval(raceLoopRef.current);
    
    raceLoopRef.current = setInterval(() => {
      setPlayer(prev => {
        const newX = prev.x + prev.speed;
        if (newX >= FINISH_LINE) {
          handleLapComplete();
          return { ...prev, x: FINISH_LINE, speed: 0 };
        }
        return { ...prev, x: newX, speed: Math.max(0, prev.speed - 0.1) };
      });
      
      setAICars(prev => prev.map(car => ({
        ...car,
        x: car.x + car.speed + Math.random() * 2,
        speed: Math.random() * 3 + 1,
      })));
      
      // Update positions
      setAICars(prev => {
        const allCars = [
          { x: player.x, name: 'Kamu' },
          ...prev.map(c => ({ x: c.x, name: c.name })),
        ].sort((a, b) => b.x - a.x);
        
        const playerPos = allCars.findIndex(c => c.name === 'Kamu') + 1;
        setPosition(playerPos);
        
        return prev;
      });
      
      // Check obstacles
      TRACK_OBSTACLES.forEach(obs => {
        if (Math.abs(player.x - obs.x) < 5 && !showObstacle) {
          setShowObstacle(obs.type);
          setGameState('question');
          const difficulty = obs.type === 'star' ? 3 : obs.type === 'boost' ? 2 : 1;
          setCurrentQuestion(generateQuestion(difficulty));
          
          setTimeout(() => setShowObstacle(null), 2000);
        }
      });
    }, 100);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRaceTime(prev => prev + 1);
    }, 1000);
  };

  const handleLapComplete = () => {
    if (lap >= totalLaps) {
      finishRace();
    } else {
      setLap(prev => prev + 1);
      setPlayer(prev => ({ ...prev, x: 0 }));
      setScore(prev => prev + 50);
    }
  };

  const handleAnswer = (answer: number) => {
    if (!currentQuestion) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const boostAmount = showObstacle === 'boost' ? 8 : showObstacle === 'star' ? 10 : 5;
      const pointsEarned = showObstacle === 'star' ? 30 : showObstacle === 'boost' ? 20 : 10;
      
      setPlayer(prev => ({ ...prev, speed: prev.speed + boostAmount }));
      setScore(prev => prev + pointsEarned);
      setBoostMeter(prev => Math.min(100, prev + 20));
    } else {
      setPlayer(prev => ({ ...prev, speed: Math.max(0, prev.speed - 2) }));
      if (showObstacle === 'stop') {
        setPlayer(prev => ({ ...prev, x: Math.max(0, prev.x - 10) }));
      }
    }
    
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentQuestion(null);
      setGameState('racing');
    }, 1000);
  };

  const finishRace = () => {
    setGameState('complete');
    if (raceLoopRef.current) clearInterval(raceLoopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!bestTime || raceTime < bestTime) {
      setBestTime(raceTime);
    }
    
    const stars = position === 1 ? 3 : position <= 2 ? 2 : 1;
    onComplete(stars, { score, position, raceTime, lap });
  };

  useEffect(() => {
    return () => {
      if (raceLoopRef.current) clearInterval(raceLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (gameState === 'menu') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 animate-bounce">🏁</div>
        <h2 className="text-3xl font-bold mb-2 text-red-600">Math Racer!</h2>
        <p className="text-gray-600 mb-6">Balapan Seru dengan Matematika!</p>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl p-6 mb-6">
          <div className="flex justify-center gap-4 text-4xl mb-4">
            {CAR_EMOJIS.slice(0, 4).map((emoji, i) => (
              <button
                key={i}
                onClick={() => setPlayer(prev => ({ ...prev, emoji }))}
                className={`p-3 rounded-xl transition-all ${
                  player.emoji === emoji ? 'bg-red-500 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="space-y-2 text-sm">
            <p>🏎️ Jawab benar = Ngebut!</p>
            <p>🛑 Jawab salah = Melambat</p>
            <p>⭐ Kumpulkan bintang untuk boost</p>
            <p>🏆 {totalLaps} lap untuk menang!</p>
          </div>
        </div>
        
        <button
          onClick={startRace}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition"
        >
          🏁 Mulai Balapan!
        </button>
      </div>
    );
  }

  if (gameState === 'countdown') {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-8xl font-bold text-red-600 animate-pulse">
            {countdown}
          </div>
          <p className="text-xl mt-4">Bersiap!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const stars = position === 1 ? 3 : position <= 2 ? 2 : 1;
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">
          {position === 1 ? '🏆' : position === 2 ? '🥈' : '🥉'}
        </div>
        <h2 className="text-2xl font-bold mb-2">Balapan Selesai!</h2>
        <p className="text-lg">Posisi: #{position}</p>
        <p className="text-gray-600">Waktu: {raceTime} detik</p>
        <p className="text-gray-600">Skor: {score}</p>
        {bestTime && <p className="text-yellow-600">🏆 Best Time: {bestTime}s</p>}
        <div className="flex justify-center gap-2 text-4xl mt-4">
          {stars >= 1 && '⭐'}
          {stars >= 2 && '⭐'}
          {stars >= 3 && '⭐'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Race HUD */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 text-white rounded-full px-4 py-2 font-bold">
            Lap {lap}/{totalLaps}
          </div>
          <div className="bg-yellow-400 rounded-full px-4 py-2 font-bold">
            #{position}
          </div>
          <div className="bg-blue-400 rounded-full px-4 py-2 font-bold text-white">
            ⏱️ {raceTime}s
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Boost:</span>
          <div className="w-32 bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-red-500 h-4 rounded-full transition-all"
              style={{ width: `${boostMeter}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Race Track */}
      <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
        {/* Track markings */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 h-1 bg-white/30"
            style={{ left: `${i * 10}%`, width: '5%' }}
          />
        ))}
        
        {/* Finish line */}
        <div
          className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-black to-white"
          style={{ left: `${(FINISH_LINE / TRACK_LENGTH) * 100}%` }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold">
            🏁
          </div>
        </div>
        
        {/* AI Cars */}
        {aiCars.map((car, i) => (
          <div
            key={i}
            className="absolute transition-all duration-100"
            style={{
              top: `${25 + i * 25}%`,
              left: `${(car.x / TRACK_LENGTH) * 100}%`,
            }}
          >
            <div className="text-2xl">{car.emoji}</div>
            <div className="text-[10px] bg-white rounded px-1 absolute -top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {car.name}
            </div>
          </div>
        ))}
        
        {/* Player Car */}
        <div
          className="absolute transition-all duration-100"
          style={{
            top: '70%',
            left: `${(player.x / TRACK_LENGTH) * 100}%`,
          }}
        >
          <div className={`text-3xl ${player.speed > 5 ? 'animate-bounce' : ''}`}>
            {player.emoji}
          </div>
          <div className="text-[10px] bg-yellow-400 rounded px-1 absolute -top-4 left-1/2 transform -translate-x-1/2">
            Kamu
          </div>
        </div>
        
        {/* Obstacles */}
        {TRACK_OBSTACLES.map((obs, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              top: '60%',
              left: `${(obs.x / TRACK_LENGTH) * 100}%`,
            }}
          >
            {showObstacle === obs.type ? (
              <span className="animate-pulse text-3xl">❗</span>
            ) : (
              obs.emoji
            )}
          </div>
        ))}
      </div>
      
      {/* Speed indicator */}
      <div className="mt-4 flex justify-center">
        <div className="bg-gray-800 text-white rounded-full px-6 py-2 inline-flex items-center gap-2">
          <span>🏎️</span>
          <span className="font-bold">{Math.round(player.speed * 10)} km/h</span>
        </div>
      </div>
      
      {/* Question Modal */}
      {gameState === 'question' && currentQuestion && !showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              {showObstacle === 'boost' && <div className="text-4xl mb-2">⚡</div>}
              {showObstacle === 'stop' && <div className="text-4xl mb-2">🛑</div>}
              {showObstacle === 'slow' && <div className="text-4xl mb-2">💨</div>}
              {showObstacle === 'star' && <div className="text-4xl mb-2">⭐</div>}
              
              <h3 className="text-xl font-bold">
                {currentQuestion.text} = ?
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 text-white p-3 rounded-xl font-bold hover:scale-105 transition"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Feedback */}
      {showFeedback && (
        <div className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 text-center z-50 ${
          isCorrect ? 'animate-bounce' : ''
        }`}>
          <div className="text-6xl">
            {isCorrect ? '🚀' : '💥'}
          </div>
          <p className={`text-xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? 'NGEBUT!' : 'MELAMBAT!'}
          </p>
        </div>
      )}
    </div>
  );
}