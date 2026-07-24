// app/components/games/MathRacer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathRacerProps {
  onComplete: (stars: number, extra?: any) => void;
}

const CARS = ['🚗', '🚙', '🏎️', '🚓', '🚕', '🚐'];
const FINISH = 100; // Persen, lebih simpel
const BASE_SPEED = 0.5; // Kecepatan dasar player
const AI_BASE_SPEED = 0.6;
const OBSTACLE_POSITIONS = [25, 50, 75, 95]; // Posisi dalam persen
const OBSTACLE_RANGE = 3; // Jarak trigger

export default function MathRacer({ onComplete }: MathRacerProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'countdown' | 'race' | 'complete'>('menu');
  const [playerPos, setPlayerPos] = useState(0); // 0-100 persen
  const [playerSpeed, setPlayerSpeed] = useState(BASE_SPEED);
  const [playerEmoji, setPlayerEmoji] = useState('🚗');
  const [aiPositions, setAiPositions] = useState([0, 0, 0]);
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
  const [currentObstacle, setCurrentObstacle] = useState<{ type: string; position: number } | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [triggeredObstacles, setTriggeredObstacles] = useState<Set<number>>(new Set());

  const raceRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref untuk nilai yang diakses di interval
  const playerPosRef = useRef(0);
  const playerSpeedRef = useRef(BASE_SPEED);
  const aiPositionsRef = useRef([0, 0, 0]);
  const lapRef = useRef(1);
  const triggeredRef = useRef<Set<number>>(new Set());
  const quizActiveRef = useRef(false);
  const stoppedRef = useRef(false);

  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { playerSpeedRef.current = playerSpeed; }, [playerSpeed]);
  useEffect(() => { aiPositionsRef.current = aiPositions; }, [aiPositions]);
  useEffect(() => { lapRef.current = lap; }, [lap]);
  useEffect(() => { triggeredRef.current = triggeredObstacles; }, [triggeredObstacles]);

  const genQ = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a: number, b: number, ans: number;
    switch (op) {
      case '+': a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 20) + 5; ans = a + b; break;
      case '-': a = Math.floor(Math.random() * 30) + 15; b = Math.floor(Math.random() * a) + 1; ans = a - b; break;
      case '×': a = Math.floor(Math.random() * 6) + 2; b = Math.floor(Math.random() * 6) + 2; ans = a * b; break;
      default: a = 0; b = 0; ans = 0;
    }
    const opts = new Set([ans]);
    while (opts.size < 4) { 
      const off = Math.floor(Math.random() * 10) + 2; 
      const w = Math.random() > 0.5 ? ans + off : Math.max(0, ans - off);
      if (w !== ans && w > 0) opts.add(w); 
    }
    return { text: `${a} ${op} ${b} = ?`, answer: ans, opts: Array.from(opts).sort(() => Math.random() - 0.5) };
  };

  const start = () => {
    // Reset semua
    setPlayerPos(0); playerPosRef.current = 0;
    setPlayerSpeed(BASE_SPEED); playerSpeedRef.current = BASE_SPEED;
    setAiPositions([0, 0, 0]); aiPositionsRef.current = [0, 0, 0];
    setScore(0); 
    setLap(1); lapRef.current = 1;
    setBoost(0); 
    setTime(0);
    setShowQuiz(false); quizActiveRef.current = false;
    setFeedback(false);
    setCurrentObstacle(null);
    setQ(null);
    setPos(1);
    setTriggeredObstacles(new Set()); triggeredRef.current = new Set();
    stoppedRef.current = false;
    
    setStep('countdown');
    setCount(3);
    
    let c = 3;
    const iv = setInterval(() => { 
      c--; 
      setCount(c); 
      if (c <= 0) { 
        clearInterval(iv); 
        setStep('race'); 
        startLoop(); 
        startTimer(); 
      } 
    }, 800);
  };

  const startLoop = () => {
    if (raceRef.current) clearInterval(raceRef.current);
    
    raceRef.current = setInterval(() => {
      if (stoppedRef.current) return; // Stop saat complete
      
      // ===== MOVE PLAYER (selalu gerak dengan base speed) =====
      const currentSpeed = playerSpeedRef.current;
      const newPos = Math.min(FINISH, playerPosRef.current + currentSpeed);
      
      playerPosRef.current = newPos;
      setPlayerPos(newPos);
      
      // Gradually decelerate ke base speed
      if (currentSpeed > BASE_SPEED) {
        const newSpeed = Math.max(BASE_SPEED, currentSpeed - 0.03);
        playerSpeedRef.current = newSpeed;
        setPlayerSpeed(newSpeed);
      }
      
      // ===== MOVE AI (random speed) =====
      const newAi = aiPositionsRef.current.map((pos, i) => {
        const aiSpeed = AI_BASE_SPEED + (Math.random() * 0.6) + (i * 0.1);
        return Math.min(FINISH, pos + aiSpeed);
      });
      aiPositionsRef.current = newAi;
      setAiPositions(newAi);
      
      // ===== UPDATE RANKING =====
      const all = [
        { pos: newPos, isPlayer: true },
        ...newAi.map(p => ({ pos: p, isPlayer: false }))
      ];
      all.sort((a, b) => b.pos - a.pos);
      const rank = all.findIndex(c => c.isPlayer) + 1;
      setPos(rank);
      
      // ===== CHECK FINISH LINE =====
      if (newPos >= FINISH) {
        if (lapRef.current >= 3) {
          // Race complete!
          stoppedRef.current = true;
          if (raceRef.current) clearInterval(raceRef.current);
          if (timeRef.current) clearInterval(timeRef.current);
          setStep('complete');
          return;
        } else {
          // Next lap
          const newLap = lapRef.current + 1;
          lapRef.current = newLap;
          setLap(newLap);
          playerPosRef.current = 0;
          setPlayerPos(0);
          playerSpeedRef.current = BASE_SPEED;
          setPlayerSpeed(BASE_SPEED);
          setScore(s => s + 50);
          setTriggeredObstacles(new Set());
          triggeredRef.current = new Set();
          setBoost(b => Math.min(100, b + 15));
        }
      }
      
      // ===== CHECK OBSTACLES =====
      if (!quizActiveRef.current) {
        for (const obsPos of OBSTACLE_POSITIONS) {
          const alreadyTriggered = triggeredRef.current.has(obsPos);
          const inRange = Math.abs(newPos - obsPos) < OBSTACLE_RANGE;
          
          if (inRange && !alreadyTriggered && newPos > 5) {
            // Trigger obstacle!
            const obsType = obsPos === 95 ? '⭐' : obsPos === 50 ? '⚡' : '🛑';
            
            // Mark as triggered
            const newTriggered = new Set(triggeredRef.current);
            newTriggered.add(obsPos);
            triggeredRef.current = newTriggered;
            setTriggeredObstacles(newTriggered);
            
            // Show quiz
            setCurrentObstacle({ type: obsType, position: obsPos });
            setQ(genQ());
            setShowQuiz(true);
            quizActiveRef.current = true;
            
            // Pause player movement during quiz
            playerSpeedRef.current = 0;
            setPlayerSpeed(0);
            break;
          }
        }
      }
    }, 100); // Update tiap 100ms
  };

  const startTimer = () => { 
    if (timeRef.current) clearInterval(timeRef.current); 
    timeRef.current = setInterval(() => setTime(t => t + 1), 1000); 
  };

  const handleAnswer = (ans: number) => {
    if (!q || feedback) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok); 
    setFeedback(true);
    
    if (ok) {
      // Boost speed!
      const boostAmount = currentObstacle?.type === '⭐' ? 8 : currentObstacle?.type === '⚡' ? 6 : 4;
      const ptsAmount = currentObstacle?.type === '⭐' ? 30 : currentObstacle?.type === '⚡' ? 20 : 10;
      
      playerSpeedRef.current = BASE_SPEED + boostAmount;
      setPlayerSpeed(playerSpeedRef.current);
      setScore(s => s + ptsAmount);
      setBoost(b => Math.min(100, b + 20));
    } else {
      // Penalty
      playerSpeedRef.current = Math.max(0.2, BASE_SPEED - 0.3);
      setPlayerSpeed(playerSpeedRef.current);
      
      if (currentObstacle?.type === '🛑') {
        const newPos = Math.max(0, playerPosRef.current - 8);
        playerPosRef.current = newPos;
        setPlayerPos(newPos);
      }
    }
    
    setTimeout(() => { 
      setSelected(null); 
      setFeedback(false);
      setQ(null); 
      setCurrentObstacle(null); 
      setShowQuiz(false);
      quizActiveRef.current = false;
      // Kembalikan ke base speed
      if (ok) {
        playerSpeedRef.current = Math.max(BASE_SPEED, playerSpeedRef.current);
        setPlayerSpeed(playerSpeedRef.current);
      } else {
        playerSpeedRef.current = BASE_SPEED;
        setPlayerSpeed(BASE_SPEED);
      }
    }, ok ? 600 : 1200);
  };

  const closeQuiz = () => {
    if (feedback) return;
    setShowQuiz(false);
    quizActiveRef.current = false;
    setQ(null);
    setCurrentObstacle(null);
    // Penalti skip
    playerSpeedRef.current = Math.max(0.2, BASE_SPEED - 0.2);
    setPlayerSpeed(playerSpeedRef.current);
    setTimeout(() => {
      playerSpeedRef.current = BASE_SPEED;
      setPlayerSpeed(BASE_SPEED);
    }, 1500);
  };

  useEffect(() => { 
    return () => { 
      if (raceRef.current) clearInterval(raceRef.current); 
      if (timeRef.current) clearInterval(timeRef.current); 
    }; 
  }, []);

  const handleComplete = () => {
    const stars = pos === 1 ? 3 : pos <= 2 ? 2 : 1;
    onComplete(stars, { score, position: pos, time, lap });
  };

  // ============ MENU ============
  if (step === 'menu') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '50px', marginBottom: '4px' }}>🏁</div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Math Racer!</h2>
      <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '10px' }}>Mobil jalan terus. Jawab kuis = NGEBUT! 🏎️</p>
      
      <p style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>Pilih mobil:</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
        {CARS.slice(0, 4).map((c, i) => (
          <button key={i} onClick={() => setPlayerEmoji(c)} 
            style={{ fontSize: '30px', padding: '6px', borderRadius: '10px', border: playerEmoji === c ? '3px solid #ef4444' : '3px solid transparent', background: playerEmoji === c ? '#fee2e2' : '#f3f4f6', cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '8px', marginBottom: '12px', fontSize: '10px', color: '#991b1b', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
        <strong>🎮 CARA MAIN:</strong><br/>
        • Mobil jalan otomatis ⚡<br/>
        • Rintangan ⭐⚡🛑 muncul = kuis!<br/>
        • Jawab benar = NGEBUT 🚀 | Salah = lambat 💥<br/>
        • Finish #1 setelah 3 lap = ⭐⭐⭐
      </div>

      <button onClick={start} style={{ padding: '12px 32px', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>
        🏁 Mulai Balapan!
      </button>
    </div>
  );

  // ============ COUNTDOWN ============
  if (step === 'countdown') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
      <div style={{ fontSize: '64px', fontWeight: '900', color: '#ef4444', animation: 'pulse 0.8s ease-in-out infinite' }}>
        {count > 0 ? count : '🏁'}
      </div>
    </div>
  );

  // ============ COMPLETE ============
  if (step === 'complete') {
    const stars = pos === 1 ? 3 : pos <= 2 ? 2 : 1;
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '50px' }}>{pos === 1 ? '🏆' : pos === 2 ? '🥈' : '🥉'}</div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: theme.heading, margin: '6px 0' }}>
          {pos === 1 ? 'Juara 1!' : pos === 2 ? 'Juara 2!' : 'Juara 3!'}
        </h2>
        <div style={{ fontSize: '32px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px', margin: '8px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '12px' }}>
          <div><strong>🏁</strong><br/>#{pos}</div>
          <div><strong>⏱</strong><br/>{time}s</div>
          <div><strong>⭐</strong><br/>{score}</div>
        </div>
        <button onClick={handleComplete} style={{ padding: '12px 28px', fontSize: '16px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  // ============ RACE ============
  return (
    <div style={{ textAlign: 'center' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '10px', gap: '4px', background: '#1e293b', borderRadius: '10px', padding: '6px 10px', color: '#fff', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '700' }}>🏁 Lap {lap}/3</span>
        <span style={{ background: pos === 1 ? '#fbbf24' : pos <= 3 ? '#94a3b8' : '#64748b', borderRadius: '8px', padding: '1px 7px', fontWeight: '700', color: '#1e293b', fontSize: '11px' }}>#{pos}</span>
        <span>⏱{time}s</span>
        <span>⭐{score}</span>
        <div style={{ width: '40px', height: '5px', background: '#334155', borderRadius: '2px' }}>
          <div style={{ width: `${boost}%`, height: '100%', background: '#f59e0b', borderRadius: '2px' }} />
        </div>
      </div>

      {/* Track */}
      <div style={{ background: '#374151', borderRadius: '12px', padding: '8px', position: 'relative', height: '150px', overflow: 'hidden', marginBottom: '8px' }}>
        {/* Road markings */}
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ position: 'absolute', top: `${15 + i * 22}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        ))}
        
        {/* Finish line */}
        <div style={{ position: 'absolute', top: 0, left: `${FINISH}%`, bottom: 0, width: '2px', background: '#fff' }} />
        
        {/* AI cars */}
        {aiPositions.map((pos, i) => (
          <div key={i} style={{ position: 'absolute', top: `${18 + i * 22}%`, left: `${pos}%`, fontSize: '16px', transition: 'left 0.1s linear' }}>
            {['🏎️', '🚓', '🚕'][i]}
          </div>
        ))}
        
        {/* Player car - PASTI DI BAWAH */}
        <div style={{ position: 'absolute', top: '78%', left: `${playerPos}%`, fontSize: '24px', transition: 'left 0.1s linear', zIndex: 10, filter: playerSpeed > BASE_SPEED + 2 ? 'brightness(1.4) drop-shadow(0 0 4px #fbbf24)' : 'none' }}>
          {playerEmoji}
        </div>

        {/* Obstacles */}
        {OBSTACLE_POSITIONS.map(ox => {
          const isTriggered = triggeredObstacles.has(ox);
          return (
            <div key={ox} style={{ 
              position: 'absolute', 
              top: '62%', 
              left: `${ox}%`, 
              fontSize: '14px',
              opacity: isTriggered ? 0.2 : 0.7,
              transition: 'opacity 0.5s'
            }}>
              {ox === 95 ? '⭐' : ox === 50 ? '⚡' : '🛑'}
            </div>
          );
        })}
      </div>

      {/* Speed indicator */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ 
          background: playerSpeed > BASE_SPEED + 2 ? '#f59e0b' : '#374151', 
          color: '#fff', 
          borderRadius: '12px', 
          padding: '4px 12px', 
          fontWeight: '700', 
          fontSize: '11px',
          transition: 'background 0.3s'
        }}>
          🏎️ {Math.round(playerSpeed * 20)} km/h
        </span>
        {playerSpeed <= BASE_SPEED && !showQuiz && (
          <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>Mendekati rintangan...</span>
        )}
      </div>

      {/* Quiz Panel */}
      {showQuiz && q && !feedback && (
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          padding: '12px', 
          border: '2px solid #e5e7eb',
          boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
          animation: 'pop 0.3s ease-out',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>
              {currentObstacle?.type === '⭐' ? '⭐ BONUS!' : currentObstacle?.type === '⚡' ? '⚡ TURBO!' : '🛑 RINTANGAN!'}
            </span>
            <button onClick={closeQuiz} style={{ background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', color: '#9ca3af' }}>
              ✕ Skip
            </button>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{q.text}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            {q.opts.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleAnswer(opt)} 
                style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: '#7c3aed', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '15px', 
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
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
          padding: '10px', 
          borderRadius: '10px', 
          background: correct ? '#d1fae5' : '#fee2e2', 
          color: correct ? '#065f46' : '#991b1b', 
          fontWeight: '700', 
          fontSize: '14px', 
          animation: 'pop 0.3s ease-out',
          textAlign: 'center'
        }}>
          {correct ? '🚀 NGEBUT!' : `💥 Jawaban: ${q?.answer}`}
        </div>
      )}
    </div>
  );
}