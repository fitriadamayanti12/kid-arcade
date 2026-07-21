// app/components/games/GeoQuest.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface GeoQuestProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Shape {
  id: string;
  name: string;
  emoji: string;
  color: string;
  formula: string;
  unlocked: boolean;
  mastered: boolean;
  questions: number;
  correct: number;
}

interface Question {
  id: number;
  shape: string;
  type: 'area' | 'perimeter';
  params: Record<string, number>;
  question: string;
  answer: number;
  options: number[];
  points: number;
  visual: string;
}

const SHAPES: Shape[] = [
  { id: 'square', name: 'Persegi', emoji: '🟨', color: '#FBBF24', formula: 'L = s × s, K = 4 × s', unlocked: true, mastered: false, questions: 0, correct: 0 },
  { id: 'rectangle', name: 'Persegi Panjang', emoji: '🟩', color: '#34D399', formula: 'L = p × l, K = 2 × (p + l)', unlocked: true, mastered: false, questions: 0, correct: 0 },
  { id: 'triangle', name: 'Segitiga', emoji: '🔺', color: '#F87171', formula: 'L = ½ × a × t, K = a + b + c', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'circle', name: 'Lingkaran', emoji: '🟡', color: '#60A5FA', formula: 'L = π × r², K = 2 × π × r', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'trapezoid', name: 'Trapesium', emoji: '🔷', color: '#A78BFA', formula: 'L = ½ × (a+b) × t, K = a+b+c+d', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'parallelogram', name: 'Jajar Genjang', emoji: '🔹', color: '#F472B6', formula: 'L = a × t, K = 2 × (a+b)', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'rhombus', name: 'Belah Ketupat', emoji: '💎', color: '#C084FC', formula: 'L = ½ × d1 × d2, K = 4 × s', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'kite', name: 'Layang-layang', emoji: '🪁', color: '#FB923C', formula: 'L = ½ × d1 × d2, K = 2 × (a+b)', unlocked: false, mastered: false, questions: 0, correct: 0 },
];

const WORLDS = [
  { id: 1, name: 'Taman Kota', emoji: '🌳', shapes: ['square', 'rectangle'], bg: 'linear-gradient(180deg, #87CEEB, #90EE90)', required: 0 },
  { id: 2, name: 'Gunung Segitiga', emoji: '⛰️', shapes: ['triangle'], bg: 'linear-gradient(180deg, #87CEEB, #8B7355)', required: 6 },
  { id: 3, name: 'Danau Bundar', emoji: '🌊', shapes: ['circle'], bg: 'linear-gradient(180deg, #87CEEB, #4169E1)', required: 9 },
  { id: 4, name: 'Kota Geometri', emoji: '🏙️', shapes: ['trapezoid', 'parallelogram', 'rhombus', 'kite'], bg: 'linear-gradient(180deg, #FFD700, #FFA500)', required: 12 },
];

export default function GeoQuest({ onComplete }: GeoQuestProps) {
  const [gameState, setGameState] = useState<'menu' | 'map' | 'playing' | 'complete'>('menu');
  const [currentWorld, setCurrentWorld] = useState(1);
  const [shapes, setShapes] = useState<Shape[]>(SHAPES);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lives, setLives] = useState(3);
  const [keys, setKeys] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [shakeScreen, setShakeScreen] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== id)), 1200);
  };

  const spawnParticles = (x: number, y: number) => {
    const emojis = ['✨', '💫', '⭐', '🌟', '💥'];
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 1000);
  };

  const generateQuestion = useCallback((shapeId: string): Question => {
    const type = Math.random() > 0.5 ? 'area' : 'perimeter';
    let params: Record<string, number> = {};
    let question = '';
    let answer = 0;
    let visual = '';

    switch (shapeId) {
      case 'square': {
        const s = Math.floor(Math.random() * 10) + 3;
        params = { s };
        if (type === 'area') {
          answer = s * s;
          question = `Persegi dengan sisi ${s} cm. Berapa LUAS-nya?`;
          visual = `🟨 ${s}cm × ${s}cm`;
        } else {
          answer = 4 * s;
          question = `Persegi dengan sisi ${s} cm. Berapa KELILING-nya?`;
          visual = `🟨 4 × ${s}cm`;
        }
        break;
      }
      case 'rectangle': {
        const p = Math.floor(Math.random() * 12) + 4;
        const l = Math.floor(Math.random() * 8) + 2;
        params = { p, l };
        if (type === 'area') {
          answer = p * l;
          question = `Persegi panjang ${p}cm × ${l}cm. Berapa LUAS-nya?`;
          visual = `🟩 ${p}cm × ${l}cm`;
        } else {
          answer = 2 * (p + l);
          question = `Persegi panjang ${p}cm × ${l}cm. Berapa KELILING-nya?`;
          visual = `🟩 2×(${p}+${l})`;
        }
        break;
      }
      case 'triangle': {
        const a = Math.floor(Math.random() * 10) + 3;
        const t = Math.floor(Math.random() * 10) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const c = Math.floor(Math.random() * 8) + 3;
        params = { a, t, b, c };
        if (type === 'area') {
          answer = Math.round((a * t) / 2);
          question = `Segitiga alas ${a}cm, tinggi ${t}cm. Berapa LUAS-nya?`;
          visual = `🔺 ½×${a}×${t}`;
        } else {
          answer = a + b + c;
          question = `Segitiga sisi ${a}cm, ${b}cm, ${c}cm. Berapa KELILING-nya?`;
          visual = `🔺 ${a}+${b}+${c}`;
        }
        break;
      }
      case 'circle': {
        const r = Math.floor(Math.random() * 7) + 3;
        params = { r };
        if (type === 'area') {
          answer = Math.round((22 / 7) * r * r);
          question = `Lingkaran jari-jari ${r}cm (π=22/7). Berapa LUAS-nya?`;
          visual = `🟡 22/7×${r}×${r}`;
        } else {
          answer = Math.round(2 * (22 / 7) * r);
          question = `Lingkaran jari-jari ${r}cm (π=22/7). Berapa KELILING-nya?`;
          visual = `🟡 2×22/7×${r}`;
        }
        break;
      }
      case 'trapezoid': {
        const a = Math.floor(Math.random() * 10) + 4;
        const b = Math.floor(Math.random() * 8) + 2;
        const t = Math.floor(Math.random() * 8) + 3;
        const c1 = Math.floor(Math.random() * 6) + 3;
        const d = Math.floor(Math.random() * 6) + 3;
        params = { a, b, t, c: c1, d };
        if (type === 'area') {
          answer = Math.round(((a + b) * t) / 2);
          question = `Trapesium sisi sejajar ${a}cm & ${b}cm, tinggi ${t}cm. LUAS?`;
          visual = `🔷 ½×(${a}+${b})×${t}`;
        } else {
          answer = a + b + c1 + d;
          question = `Trapesium sisi ${a},${b},${c1},${d}cm. KELILING?`;
          visual = `🔷 ${a}+${b}+${c1}+${d}`;
        }
        break;
      }
      case 'parallelogram': {
        const a = Math.floor(Math.random() * 10) + 3;
        const t = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 6) + 3;
        params = { a, t, b };
        if (type === 'area') {
          answer = a * t;
          question = `Jajar genjang alas ${a}cm, tinggi ${t}cm. LUAS?`;
          visual = `🔹 ${a}×${t}`;
        } else {
          answer = 2 * (a + b);
          question = `Jajar genjang sisi ${a}cm & ${b}cm. KELILING?`;
          visual = `🔹 2×(${a}+${b})`;
        }
        break;
      }
      case 'rhombus': {
        const d1 = Math.floor(Math.random() * 8) + 4;
        const d2 = Math.floor(Math.random() * 8) + 4;
        const s = Math.floor(Math.random() * 6) + 3;
        params = { d1, d2, s };
        if (type === 'area') {
          answer = Math.round((d1 * d2) / 2);
          question = `Belah ketupat diagonal ${d1}cm & ${d2}cm. LUAS?`;
          visual = `💎 ½×${d1}×${d2}`;
        } else {
          answer = 4 * s;
          question = `Belah ketupat sisi ${s}cm. KELILING?`;
          visual = `💎 4×${s}`;
        }
        break;
      }
      case 'kite': {
        const d1 = Math.floor(Math.random() * 10) + 4;
        const d2 = Math.floor(Math.random() * 8) + 4;
        const a = Math.floor(Math.random() * 6) + 3;
        const b = Math.floor(Math.random() * 6) + 3;
        params = { d1, d2, a, b };
        if (type === 'area') {
          answer = Math.round((d1 * d2) / 2);
          question = `Layang-layang diagonal ${d1}cm & ${d2}cm. LUAS?`;
          visual = `🪁 ½×${d1}×${d2}`;
        } else {
          answer = 2 * (a + b);
          question = `Layang-layang sisi ${a}cm & ${b}cm. KELILING?`;
          visual = `🪁 2×(${a}+${b})`;
        }
        break;
      }
    }

    const options = new Set([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 20) + 1;
      const opt = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
      if (opt !== answer) options.add(opt);
    }

    return {
      id: Date.now(),
      shape: shapeId,
      type,
      params,
      question,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      points: type === 'area' ? 15 : 10,
      visual,
    };
  }, []);

  const startWorld = (worldId: number) => {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return;
    
    const worldShapes = shapes.filter(s => world.shapes.includes(s.id) && s.unlocked);
    if (worldShapes.length === 0) return;

    setCurrentWorld(worldId);
    setQuestionIndex(0);
    setTotalQuestions(worldShapes.length * 3);
    setScore(0);
    setCombo(0);
    setLives(3);
    
    const randomShape = worldShapes[Math.floor(Math.random() * worldShapes.length)];
    setCurrentQuestion(generateQuestion(randomShape.id));
    setGameState('playing');
  };

  const handleAnswer = (answer: number) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    const rect = gameAreaRef.current?.getBoundingClientRect();
    const x = rect ? rect.width / 2 : 200;
    const y = rect ? rect.height / 2 : 200;

    if (correct) {
      const bonusPoints = Math.floor(combo / 3) * 5;
      const points = currentQuestion.points + bonusPoints;
      
      setScore(s => s + points);
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
      
      // Update shape stats
      setShapes(prev => prev.map(s => 
        s.id === currentQuestion.shape 
          ? { ...s, questions: s.questions + 1, correct: s.correct + 1 }
          : s
      ));

      // Check mastery
      setShapes(prev => {
        const shape = prev.find(s => s.id === currentQuestion.shape);
        if (shape && shape.correct >= 5 && !shape.mastered) {
          addFloatingText(`🎓 ${shape.name} Dikuasai!`, x, y - 30, '#00FF00');
          
          // Unlock next shapes
          const currentIndex = SHAPES.findIndex(s => s.id === shape.id);
          if (currentIndex < SHAPES.length - 1) {
            const nextShape = SHAPES[currentIndex + 1];
            addFloatingText(`🔓 ${nextShape.name} Terbuka!`, x, y - 60, '#FFD700');
          }
          
          return prev.map((s, i) => {
            if (s.id === shape.id) return { ...s, mastered: true };
            if (i === currentIndex + 1 || i === currentIndex + 2) return { ...s, unlocked: true };
            return s;
          });
        }
        return prev;
      });

      setKeys(k => k + 1);
      addFloatingText(`+${points}`, x, y - 10, '#4CAF50');
      spawnParticles(x, y);
    } else {
      setCombo(0);
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameState('complete'), 1500);
          return 0;
        }
        return newLives;
      });
      addFloatingText('❌', x, y, '#FF0000');
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);
    }

    setTimeout(() => {
      if (questionIndex < totalQuestions - 1 && lives > 1) {
        setQuestionIndex(i => i + 1);
        const world = WORLDS.find(w => w.id === currentWorld);
        const worldShapes = shapes.filter(s => world?.shapes.includes(s.id) && s.unlocked);
        const randomShape = worldShapes[Math.floor(Math.random() * worldShapes.length)];
        setCurrentQuestion(generateQuestion(randomShape.id));
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowFormula(false);
      } else {
        setGameState('complete');
      }
    }, 1500);
  };

  const handleComplete = () => {
    const totalMastered = shapes.filter(s => s.mastered).length;
    const totalCorrect = shapes.reduce((sum, s) => sum + s.correct, 0);
    const stars = totalMastered >= 6 ? 3 : totalMastered >= 4 ? 2 : 1;
    
    onComplete(stars, { 
      score, 
      totalMastered, 
      totalCorrect, 
      maxCombo, 
      keys 
    });
  };

  const renderShapeVisual = (shape: string, params: Record<string, number>, type: 'area' | 'perimeter') => {
    const svgStyle = { width: '120px', height: '100px', margin: '0 auto' };
    
    switch (shape) {
      case 'square':
        return (
          <svg viewBox="0 0 120 100" style={svgStyle}>
            <rect x="20" y="10" width="80" height="80" fill="#FBBF24" stroke="#D97706" strokeWidth="2" rx="4"/>
            <text x="60" y="55" textAnchor="middle" fontSize="14" fill="#92400E" fontWeight="bold">{params.s}cm</text>
            <text x="60" y="98" textAnchor="middle" fontSize="12" fill="#666">{params.s}cm</text>
          </svg>
        );
      case 'rectangle':
        return (
          <svg viewBox="0 0 140 100" style={svgStyle}>
            <rect x="10" y="10" width="120" height="60" fill="#34D399" stroke="#059669" strokeWidth="2" rx="4"/>
            <text x="70" y="45" textAnchor="middle" fontSize="14" fill="#064E3B" fontWeight="bold">{params.p}cm × {params.l}cm</text>
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 120 100" style={svgStyle}>
            <polygon points="60,5 10,85 110,85" fill="#F87171" stroke="#DC2626" strokeWidth="2"/>
            <text x="60" y="55" textAnchor="middle" fontSize="12" fill="#7F1D1D" fontWeight="bold">alas {params.a}cm</text>
            <text x="60" y="75" textAnchor="middle" fontSize="11" fill="#7F1D1D">t={params.t}cm</text>
          </svg>
        );
      case 'circle':
        return (
          <svg viewBox="0 0 120 100" style={svgStyle}>
            <circle cx="60" cy="50" r="35" fill="#60A5FA" stroke="#2563EB" strokeWidth="2"/>
            <line x1="60" y1="50" x2="95" y2="50" stroke="#1E3A5F" strokeWidth="1.5" strokeDasharray="4"/>
            <text x="60" y="55" textAnchor="middle" fontSize="14" fill="#1E3A5F" fontWeight="bold">r={params.r}cm</text>
          </svg>
        );
      default:
        return <div style={{ fontSize: '60px', textAlign: 'center' }}>{SHAPES.find(s => s.id === shape)?.emoji || '📐'}</div>;
    }
  };

  // Menu Screen
  if (gameState === 'menu') {
    const totalMastered = shapes.filter(s => s.mastered).length;
    
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '8px' }}>📐</div>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#7C3AED', marginBottom: '4px' }}>GeoQuest!</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Kuasai Luas & Keliling Bangun Datar!</p>

        {/* Shape Mastery */}
        <div style={{ background: '#F5F3FF', borderRadius: '20px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>📊 Progress Bangun Datar:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {shapes.map(shape => (
              <div key={shape.id} style={{
                padding: '10px', borderRadius: '12px',
                background: shape.mastered ? '#D1FAE5' : shape.unlocked ? 'white' : '#f5f5f5',
                border: `2px solid ${shape.mastered ? '#059669' : shape.unlocked ? shape.color : '#ddd'}`,
                opacity: shape.unlocked ? 1 : 0.5,
              }}>
                <div style={{ fontSize: '30px' }}>{shape.emoji}</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{shape.name}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {shape.mastered ? '✅ Dikuasai' : shape.unlocked ? `${shape.correct}/5` : '🔒'}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '12px', color: '#7C3AED', fontWeight: 'bold' }}>
            🏆 {totalMastered}/8 Bangun Dikuasai
          </p>
        </div>

        {/* Worlds */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {WORLDS.map(world => {
            const worldShapes = shapes.filter(s => world.shapes.includes(s.id));
            const unlocked = worldShapes.every(s => s.unlocked);
            const completed = worldShapes.every(s => s.mastered);
            
            return (
              <button
                key={world.id}
                onClick={() => unlocked && startWorld(world.id)}
                disabled={!unlocked}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: '2px solid #ddd',
                  background: completed ? '#D1FAE5' : unlocked ? 'white' : '#f5f5f5',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.6,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '40px' }}>{world.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    {completed ? '✅ ' : ''}World {world.id}: {world.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {world.shapes.map(s => shapes.find(sh => sh.id === s)?.emoji).join(' ')}
                  </div>
                  {!unlocked && (
                    <div style={{ fontSize: '12px', color: '#EF4444' }}>
                      🔒 Kuasai {world.required} bangun dulu
                    </div>
                  )}
                </div>
                {unlocked && <span style={{ fontSize: '24px' }}>▶️</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Complete Screen
  if (gameState === 'complete') {
    const totalMastered = shapes.filter(s => s.mastered).length;
    const stars = totalMastered >= 6 ? 3 : totalMastered >= 4 ? 2 : 1;
    
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '28px', color: '#7C3AED' }}>World {currentWorld} Selesai!</h2>
        <div style={{ background: '#F5F3FF', borderRadius: '20px', padding: '20px', margin: '20px 0' }}>
          <p>Skor: <strong>{score}</strong></p>
          <p>Kombo Terbaik: <strong>🔥 {maxCombo}</strong></p>
          <p>Kunci: <strong>🔑 {keys}</strong></p>
          <p>Bangun Dikuasai: <strong>{totalMastered}/8</strong></p>
        </div>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={() => setGameState('menu')} style={btnStyle('#7C3AED')}>🗺️ Peta</button>
          <button onClick={handleComplete} style={btnStyle('#F59E0B')}>🏆 Klaim</button>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div ref={gameAreaRef} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', transform: shakeScreen ? 'translateX(5px)' : 'none', transition: 'transform 0.1s' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={hudStyle('⭐', score)}>{score}</div>
        <div style={hudStyle('🔥', combo)}>{combo}</div>
        <div style={hudStyle('❤️', lives)}>{Array.from({ length: lives }, () => '❤️').join('')}</div>
        <div style={hudStyle('📝', questionIndex + 1)}>{questionIndex + 1}/{totalQuestions}</div>
      </div>

      {/* Question Card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 'bold', marginBottom: '8px' }}>
          {currentQuestion?.type === 'area' ? '📏 LUAS' : '📐 KELILING'} • {SHAPES.find(s => s.id === currentQuestion?.shape)?.name}
        </div>
        
        {/* Visual */}
        {currentQuestion && renderShapeVisual(currentQuestion.shape, currentQuestion.params, currentQuestion.type)}
        
        <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{currentQuestion?.visual}</p>
        
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '12px' }}>{currentQuestion?.question}</h3>
        
        <button onClick={() => setShowFormula(!showFormula)} style={{ border: 'none', background: 'none', color: '#7C3AED', cursor: 'pointer', fontSize: '13px', marginTop: '8px', textDecoration: 'underline' }}>
          {showFormula ? 'Sembunyikan' : '💡 Lihat Rumus'}
        </button>
        {showFormula && (
          <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '10px', marginTop: '8px', fontSize: '14px', fontWeight: 'bold', color: '#92400E' }}>
            {SHAPES.find(s => s.id === currentQuestion?.shape)?.formula}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {currentQuestion?.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={showFeedback}
            style={{
              padding: '16px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '2px solid #ddd',
              background: showFeedback && opt === currentQuestion.answer ? '#10B981' :
                         showFeedback && opt === selectedAnswer ? '#EF4444' : 'white',
              color: showFeedback && (opt === currentQuestion.answer || opt === selectedAnswer) ? 'white' : '#1F2937',
              cursor: showFeedback ? 'default' : 'pointer',
              transition: 'all 0.2s',
              transform: showFeedback && opt === currentQuestion.answer ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {opt} cm{currentQuestion?.type === 'area' ? '²' : ''}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div style={{ 
          marginTop: '16px', padding: '16px', borderRadius: '16px',
          background: isCorrect ? '#D1FAE5' : '#FEE2E2',
          border: `2px solid ${isCorrect ? '#6EE7B7' : '#FCA5A5'}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '30px' }}>{isCorrect ? '🎉' : '😢'}</div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: isCorrect ? '#065F46' : '#991B1B' }}>
            {isCorrect ? 'Benar!' : `Jawaban: ${currentQuestion?.answer} cm${currentQuestion?.type === 'area' ? '²' : ''}`}
          </p>
        </div>
      )}

      {/* Floating texts & particles */}
      {floatingTexts.map(ft => (
        <div key={ft.id} style={{ position: 'fixed', left: ft.x, top: ft.y, color: ft.color, fontWeight: 'bold', fontSize: '20px', pointerEvents: 'none', zIndex: 100, animation: 'floatUp 1.2s ease-out forwards' }}>{ft.text}</div>
      ))}
      {particles.map(p => (
        <div key={p.id} style={{ position: 'fixed', left: p.x, top: p.y, fontSize: '20px', pointerEvents: 'none', zIndex: 99, animation: 'particleBurst 1s ease-out forwards' }}>{p.emoji}</div>
      ))}

      <style>{`
        @keyframes floatUp { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-60px); } }
        @keyframes particleBurst { 0% { opacity:1; transform:scale(1) translate(0,0); } 100% { opacity:0; transform:scale(0) translate(${Math.random()*100-50}px, ${Math.random()*100-50}px); } }
      `}</style>
    </div>
  );
}

function hudStyle(icon: string, value: number | string) {
  return {
    background: 'rgba(124,58,237,0.1)',
    padding: '8px 14px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '12px 28px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };
}