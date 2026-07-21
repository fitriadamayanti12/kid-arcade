// components/games/CountObjects.tsx (Kelas 3)
'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const generateQuestions = useCallback(() => {
    const newQuestions: Question[] = [];
    const totalQuestions = 5;
    
    for (let i = 0; i < totalQuestions; i++) {
      const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      let num1: number, num2: number, answer: number;
      
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 10) + 1; // 1-10
          num2 = Math.floor(Math.random() * 10) + 1; // 1-10
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 10) + 5; // 5-14
          num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
          answer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 5) + 1; // 1-5
          num2 = Math.floor(Math.random() * 5) + 1; // 1-5
          answer = num1 * num2;
          break;
        default:
          num1 = 0;
          num2 = 0;
          answer = 0;
      }
      
      // Generate object colors
      const objects: string[] = [];
      const totalObjects = operation === '-' ? num1 : (operation === '×' ? num1 * num2 : num1 + num2);
      
      // For subtraction, show num1 objects then cross out num2
      if (operation === '-') {
        for (let j = 0; j < num1; j++) {
          objects.push(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
        }
      } else {
        for (let j = 0; j < totalObjects; j++) {
          objects.push(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
        }
      }
      
      newQuestions.push({ num1, num2, operation, answer, objects });
    }
    
    setQuestions(newQuestions);
  }, []);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const generateAnswerOptions = (correctAnswer: number): number[] => {
    const options = new Set<number>([correctAnswer]);
    
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const option = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
      if (option >= 0) {
        options.add(option);
      }
    }
    
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    setTotalAttempts(prev => prev + 1);
    const correct = answer === questions[currentQuestion].answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
      } else {
        setGameComplete(true);
        const stars = calculateStars(score + (correct ? 1 : 0), totalAttempts + 1);
        onComplete(stars, { score: score + (correct ? 1 : 0), total: questions.length });
      }
    }, 1500);
  };

  const calculateStars = (correctAnswers: number, attempts: number): number => {
    const accuracy = correctAnswers / questions.length;
    if (accuracy === 1) return 3;
    if (accuracy >= 0.6) return 2;
    return 1;
  };

  const renderObjects = (question: Question) => {
    if (question.operation === '-') {
      return (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {question.objects.map((obj, idx) => (
            <div 
              key={idx} 
              className={`text-3xl sm:text-4xl transition-all duration-300 ${
                idx >= question.num1 - question.num2 ? 'opacity-20 line-through' : ''
              }`}
            >
              {obj}
            </div>
          ))}
        </div>
      );
    }
    
    if (question.operation === '×') {
      // Show as rows and columns
      const rows = question.num1;
      const cols = question.num2;
      return (
        <div className="space-y-2 mb-4">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex gap-2 justify-center">
              {Array.from({ length: cols }).map((_, col) => (
                <div key={col} className="text-3xl sm:text-4xl">
                  {question.objects[row * cols + col]}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {question.objects.map((obj, idx) => (
          <div key={idx} className="text-3xl sm:text-4xl">
            {obj}
          </div>
        ))}
      </div>
    );
  };

  if (questions.length === 0) {
    return <div className="text-center py-12">Memuat soal...</div>;
  }

  const question = questions[currentQuestion];
  const options = generateAnswerOptions(question.answer);

  if (gameComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Permainan Selesai!</h2>
        <p className="text-lg mb-4">
          Skor: {score} / {questions.length}
        </p>
        <div className="flex justify-center gap-2 text-4xl">
          {calculateStars(score, totalAttempts) >= 1 && '⭐'}
          {calculateStars(score, totalAttempts) >= 2 && '⭐'}
          {calculateStars(score, totalAttempts) >= 3 && '⭐'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-600">
          Soal {currentQuestion + 1} dari {questions.length}
        </span>
        <span className="text-sm font-semibold text-green-600">
          Benar: {score}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Display */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="text-5xl sm:text-6xl font-bold text-orange-600 mb-2">
            {question.num1} {question.operation} {question.num2} = ?
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {question.operation === '+' && 'Hitung semua benda di bawah ini'}
            {question.operation === '-' && 'Hitung benda yang tidak dicoret'}
            {question.operation === '×' && `${question.num1} baris × ${question.num2} kolom = berapa benda semuanya?`}
          </p>
        </div>
        
        {renderObjects(question)}
        
        {question.operation === '-' && (
          <p className="text-center text-sm text-red-500 mt-2">
            ✗ Coret {question.num2} benda
          </p>
        )}
        
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-blue-500 hover:text-blue-700 underline mx-auto block mt-4"
        >
          {showHint ? 'Sembunyikan petunjuk' : '🔍 Lihat petunjuk'}
        </button>
        
        {showHint && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>
              {question.operation === '+' && `Tambahkan ${question.num1} + ${question.num2} = hitung semua benda!`}
              {question.operation === '-' && `Kurangi ${question.num1} - ${question.num2} = hitung benda yang tersisa!`}
              {question.operation === '×' && `Kalikan ${question.num1} × ${question.num2} = ${question.num1} kelompok masing-masing ${question.num2} benda!`}
            </p>
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showFeedback && handleAnswer(option)}
            disabled={showFeedback}
            className={`p-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
              showFeedback && option === question.answer
                ? 'bg-green-500 text-white scale-110'
                : showFeedback && option === selectedAnswer && !isCorrect
                ? 'bg-red-500 text-white'
                : 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`mt-4 text-center p-3 rounded-xl text-lg font-bold ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? '🎉 Benar! Pintar sekali!' : `❌ Jawaban benar adalah ${question.answer}`}
        </div>
      )}
    </div>
  );
}