// app/components/FillBlanks.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface FillBlanksProps {
  playerName: string;
  onComplete: (stars: number, score: number) => void;
}

interface Question {
  id: number;
  word: string;
  displayWord: string;
  answer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const questions: Question[] = [
  // Easy (hilang 1 huruf)
  { id: 1, word: 'KUCING', displayWord: 'K_CING', answer: 'U', hint: 'Hewan yang suka mengeong', difficulty: 'easy' },
  { id: 2, word: 'ANJING', displayWord: 'A_JING', answer: 'N', hint: 'Hewan yang suka menggonggong', difficulty: 'easy' },
  { id: 3, word: 'BURUNG', displayWord: 'B_RUNG', answer: 'U', hint: 'Hewan yang bisa terbang', difficulty: 'easy' },
  { id: 4, word: 'IKAN', displayWord: 'I_AN', answer: 'K', hint: 'Hewan yang hidup di air', difficulty: 'easy' },
  { id: 5, word: 'SAPI', displayWord: 'S_PI', answer: 'A', hint: 'Hewan yang menghasilkan susu', difficulty: 'easy' },
  { id: 6, word: 'KATAK', displayWord: 'K_TAK', answer: 'A', hint: 'Hewan yang suka melompat', difficulty: 'easy' },
  
  // Medium (hilang 2 huruf)
  { id: 7, word: 'GAJAH', displayWord: 'G_JA_', answer: 'AH', hint: 'Hewan besar dengan belalai', difficulty: 'medium' },
  { id: 8, word: 'KELINCI', displayWord: 'K_L_NCI', answer: 'EI', hint: 'Hewan dengan telinga panjang', difficulty: 'medium' },
  { id: 9, word: 'KURA-KURA', displayWord: 'K_R_-K_R_', answer: 'UA UA', hint: 'Hewan yang membawa rumah di punggung', difficulty: 'medium' },
  { id: 10, word: 'KAMBING', displayWord: 'K_MB_NG', answer: 'AI', hint: 'Hewan dengan tanduk', difficulty: 'medium' },
  { id: 11, word: 'HARIMAU', displayWord: 'H_R_M_U', answer: 'A I', hint: 'Hewan buas loreng', difficulty: 'medium' },
  { id: 12, word: 'ZEBRA', displayWord: 'Z_BR_', answer: 'EA', hint: 'Hewan bergaris hitam putih', difficulty: 'medium' },
  
  // Hard (hilang banyak huruf)
  { id: 13, word: 'KEPITING', displayWord: 'K_P_T_NG', answer: 'E I I', hint: 'Hewan yang berjalan menyamping', difficulty: 'hard' },
  { id: 14, word: 'KAPAL SELAM', displayWord: 'K_P_L S_L_M', answer: 'A EA A', hint: 'Kendaraan yang bisa berjalan di dalam air', difficulty: 'hard' },
  { id: 15, word: 'PESAWAT', displayWord: 'P_S_W_T', answer: 'E A A', hint: 'Kendaraan yang bisa terbang', difficulty: 'hard' },
];

export default function FillBlanks({ playerName, onComplete }: FillBlanksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const { playSound } = useSoundEffect();

  // Filter questions based on difficulty
  const filteredQuestions = questions.filter(q => 
    difficultyFilter === 'all' ? true : q.difficulty === difficultyFilter
  );

  // Get random questions not used yet
  const getRandomQuestion = () => {
    const available = filteredQuestions.filter(q => !usedQuestions.has(q.id));
    if (available.length === 0) {
      // All questions used, complete game
      setCompleted(true);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const loadNewQuestion = () => {
    const question = getRandomQuestion();
    if (question) {
      setCurrentIndex(question.id);
      setUserAnswer('');
      setShowHint(false);
      setFeedback('');
      playSound('click');
    } else {
      setCompleted(true);
      // Calculate final stars
      const totalQuestions = filteredQuestions.length;
      const percentage = (score / totalQuestions) * 100;
      let stars = 1;
      if (percentage >= 80) stars = 3;
      else if (percentage >= 60) stars = 2;
      onComplete(stars, score);
    }
  };

  const checkAnswer = () => {
    const question = questions.find(q => q.id === currentIndex);
    if (!question) return;

    // Normalize answer (remove spaces, uppercase)
    const normalizedUser = userAnswer.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedCorrect = question.answer.trim().toUpperCase().replace(/\s+/g, ' ');

    if (normalizedUser === normalizedCorrect) {
      // Correct answer
      const newScore = score + 1;
      setScore(newScore);
      setUsedQuestions(prev => new Set([...prev, question.id]));
      setFeedback('✅ Benar! +1 poin');
      playSound('correct');
      
      setTimeout(() => {
        loadNewQuestion();
      }, 1500);
    } else {
      // Wrong answer
      setFeedback(`❌ Salah! Jawaban yang benar: ${question.answer}`);
      playSound('wrong');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const startNewGame = () => {
    setUsedQuestions(new Set());
    setScore(0);
    setCompleted(false);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowHint(false);
    setFeedback('');
    playSound('click');
    
    // Load first question
    setTimeout(() => {
      const question = getRandomQuestion();
      if (question) setCurrentIndex(question.id);
    }, 100);
  };

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [difficultyFilter]);

  const currentQuestion = questions.find(q => q.id === currentIndex);
  const totalQuestions = filteredQuestions.length;
  const progressPercent = (usedQuestions.size / totalQuestions) * 100;

  if (completed) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Game Selesai!</h2>
        <p className="text-lg mb-2">Kamu menjawab {score} dari {totalQuestions} soal dengan benar</p>
        <p className="text-sm text-gray-600 mb-6">
          Nilai: {Math.round((score / totalQuestions) * 100)}%
        </p>
        <button
          onClick={startNewGame}
          className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-600 transition"
        >
          🔄 Main Lagi
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse text-4xl">📖</div>
        <p className="text-gray-500 mt-4">Memuat soal...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-teal-600 mb-2">✏️ Lengkapi Kata yang Hilang</h2>
        <p className="text-sm text-gray-600">Isi huruf yang tepat untuk melengkapi kata!</p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setDifficultyFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            difficultyFilter === 'all' 
              ? 'bg-teal-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          📚 Semua
        </button>
        <button
          onClick={() => setDifficultyFilter('easy')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            difficultyFilter === 'easy' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          🌱 Mudah
        </button>
        <button
          onClick={() => setDifficultyFilter('medium')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            difficultyFilter === 'medium' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          ⚡ Sedang
        </button>
        <button
          onClick={() => setDifficultyFilter('hard')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            difficultyFilter === 'hard' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          🔥 Sulit
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Soal: {usedQuestions.size + 1} / {totalQuestions}</span>
          <span>Skor: {score} ⭐</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-400 to-teal-600 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-6 shadow-xl">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">
            {currentQuestion.difficulty === 'easy' && '🌱 Mudah'}
            {currentQuestion.difficulty === 'medium' && '⚡ Sedang'}
            {currentQuestion.difficulty === 'hard' && '🔥 Sulit'}
          </div>
          <div className="text-5xl font-mono font-bold tracking-wider text-teal-700 mb-4">
            {currentQuestion.displayWord.split('').map((char, i) => (
              <span key={i} className={char === '_' ? 'text-red-500 underline decoration-wavy' : ''}>
                {char}
              </span>
            ))}
          </div>
          
          {/* Petunjuk */}
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-teal-500 hover:text-teal-700 underline"
            >
              {showHint ? 'Sembunyikan petunjuk' : '🔍 Butuh petunjuk?'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-100 rounded-lg text-sm">
                💡 Petunjuk: {currentQuestion.hint}
              </div>
            )}
          </div>

          {/* Input Answer */}
          <div className="flex gap-3 justify-center mt-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') checkAnswer();
              }}
              placeholder="Masukkan huruf yang hilang..."
              className="px-4 py-3 border-2 rounded-xl w-48 text-center text-lg font-bold focus:outline-none focus:border-teal-400"
              autoFocus
            />
            <button
              onClick={checkAnswer}
              className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
            >
              Jawab ✅
            </button>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center p-3 rounded-lg mb-4 ${
          feedback.includes('Benar') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {feedback}
        </div>
      )}

      {/* Keyboard Hint */}
      <div className="text-center text-xs text-gray-400">
        💡 Ketik huruf yang hilang, lalu tekan Enter
      </div>
    </div>
  );
}