// app/components/games/CountObjects.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface CountObjectsProps {
  onComplete: (stars: number, extra?: any) => void;
}

type Operation = '+' | '-' | '×';

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  objects: string[];
}

const OBJECTS = ['🔵', '🟢', '🔴', '🟡', '🟣', '🟠'];
const OPERATIONS: Operation[] = ['+', '-', '×'];

export default function CountObjects({ onComplete }: CountObjectsProps) {
  const theme = useThemeStyles();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const generateQuestions = useCallback(() => {
    const newQuestions: Question[] = [];
    
    for (let i = 0; i < 8; i++) {
      const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      let num1: number, num2: number, answer: number;
      
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 10) + 5;
          num2 = Math.floor(Math.random() * num1) + 1;
          answer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 5) + 1;
          num2 = Math.floor(Math.random() * 5) + 1;
          answer = num1 * num2;
          break;
        default:
          num1 = 0; num2 = 0; answer = 0;
      }
      
      const objects: string[] = [];
      const total = operation === '-' ? num1 : (operation === '×' ? num1 * num2 : num1 + num2);
      for (let j = 0; j < total; j++) {
        objects.push(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
      }
      
      newQuestions.push({ num1, num2, operation, answer, objects });
    }
    
    setQuestions(newQuestions);
  }, []);

  useEffect(() => { generateQuestions(); }, [generateQuestions]);

  const generateOptions = (correct: number): number[] => {
    const opts = new Set<number>([correct]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const opt = Math.random() > 0.5 ? correct + offset : Math.max(0, correct - offset);
      opts.add(opt);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(p => p + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
      } else {
        const finalScore = score + (correct ? 1 : 0);
        const stars = finalScore >= 7 ? 3 : finalScore >= 5 ? 2 : 1;
        setGameComplete(true);
        onComplete(stars, { score: finalScore, total: questions.length });
      }
    }, 1000);
  };

  const renderObjects = (q: Question) => {
    if (q.operation === '×') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {Array.from({ length: Math.min(q.num1, 5) }).map((_, row) => (
            <div key={row} style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {Array.from({ length: q.num2 }).map((_, col) => (
                <span key={col} style={{ fontSize: '28px' }}>{q.objects[row * q.num2 + col]}</span>
              ))}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
        {q.objects.map((obj, idx) => (
          <span key={idx} style={{
            fontSize: '28px',
            opacity: q.operation === '-' && idx >= q.num1 - q.num2 ? 0.3 : 1,
            textDecoration: q.operation === '-' && idx >= q.num1 - q.num2 ? 'line-through' : 'none',
            transition: 'all 0.3s',
          }}>{obj}</span>
        ))}
      </div>
    );
  };

  if (questions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>Memuat soal...</div>;
  }

  if (gameComplete) {
    const stars = score >= 7 ? 3 : score >= 5 ? 2 : 1;
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Permainan Selesai!</h2>
        <p style={{ fontSize: '16px', color: theme.textSecondary }}>Skor: {score}/{questions.length}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const options = generateOptions(q.answer);

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '16px', textAlign: 'center' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <span style={{ color: theme.textSecondary }}>Soal {currentQuestion + 1}/{questions.length}</span>
        <span style={{ color: '#10b981', fontWeight: '700' }}>Benar: {score}</span>
      </div>
      
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '16px' }}>
        <div style={{ width: `${(currentQuestion / questions.length) * 100}%`, height: '100%', background: '#6366f1', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', boxShadow: theme.shadow, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#f97316', marginBottom: '12px' }}>
          {q.num1} {q.operation} {q.num2} = ?
        </h3>
        
        {renderObjects(q)}
        
        {q.operation === '-' && (
          <p style={{ fontSize: '13px', color: '#ef4444' }}>✗ {q.num2} benda dicoret</p>
        )}
        
        <button onClick={() => setShowHint(!showHint)} style={{
          background: 'none', border: 'none', color: '#6366f1',
          fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
        }}>
          {showHint ? 'Sembunyikan' : '💡 Petunjuk'}
        </button>
        {showHint && (
          <div style={{ marginTop: '8px', padding: '8px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#3b82f6' }}>
            {q.operation === '+' && `Hitung semua: ${q.num1} + ${q.num2}`}
            {q.operation === '-' && `Benda tersisa: ${q.num1} - ${q.num2}`}
            {q.operation === '×' && `${q.num1} baris × ${q.num2} kolom`}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} disabled={showFeedback}
            style={{
              padding: '14px', fontSize: '22px', fontWeight: '700', borderRadius: '14px', border: 'none',
              background: showFeedback && opt === q.answer ? '#10b981' 
                : showFeedback && opt === selectedAnswer && opt !== q.answer ? '#ef4444'
                : theme.bgHover,
              color: (showFeedback && (opt === q.answer || opt === selectedAnswer)) ? '#fff' : theme.text,
              cursor: showFeedback ? 'default' : 'pointer',
              transform: showFeedback && opt === q.answer ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div style={{
          marginTop: '12px', padding: '10px', borderRadius: '10px',
          background: isCorrect ? '#d1fae5' : '#fee2e2',
          color: isCorrect ? '#065f46' : '#991b1b',
          fontWeight: '600', fontSize: '15px',
          animation: 'pop 0.3s ease-out',
        }}>
          {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${q.answer}`}
        </div>
      )}
    </div>
  );
}