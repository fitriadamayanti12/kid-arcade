// app/components/BubbleMath.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface Bubble {
  id: number;
  number: number;
  x: number;
  y: number;
}

interface BubbleMathProps {
  playerName: string;
  onComplete: (score: number) => void;
}

export default function BubbleMath({ playerName, onComplete }: BubbleMathProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', answer: 0 });
  const [message, setMessage] = useState('');
  const { playSound } = useSoundEffect();

  // Generate soal matematika (hanya PENJUMLAHAN, tidak ada pengurangan)
  const generateNewQuestion = () => {
    // Bilangan 1-10 agar tidak terlalu besar
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = a + b; // HANYA PENJUMLAHAN
    
    setCurrentQuestion({
      text: `${a} + ${b} = ?`,
      answer: answer
    });
    
    return answer;
  };

  // Generate balon dengan PASTI ada jawaban yang benar
  const generateBubbles = (correctAnswer: number) => {
    const newBubbles: Bubble[] = [];
    
    // Pastikan jawaban benar ada di antara 2-20 (karena penjumlahan max 20)
    const safeAnswer = Math.min(20, Math.max(2, correctAnswer));
    
    // Buat pilihan angka yang selalu mencakup jawaban benar
    let possibleNumbers = [
      safeAnswer,                           // jawaban benar (PASTI ADA)
      safeAnswer + 1,                       // +1
      safeAnswer - 1,                       // -1 (jika > 0)
      safeAnswer + 2,                       // +2
      Math.max(1, safeAnswer - 2),          // -2 (minimal 1)
      safeAnswer + 3,                       // +3
    ];
    
    // Filter angka yang valid (1-20)
    possibleNumbers = possibleNumbers.filter(n => n >= 1 && n <= 20);
    
    // Ambil 6 angka unik
    const uniqueNumbers = [...new Set(possibleNumbers)];
    
    // Jika kurang dari 6, tambah angka random
    while (uniqueNumbers.length < 6) {
      const randomNum = Math.floor(Math.random() * 20) + 1;
      if (!uniqueNumbers.includes(randomNum)) {
        uniqueNumbers.push(randomNum);
      }
    }
    
    // Acak urutan angka
    const shuffledNumbers = uniqueNumbers.sort(() => Math.random() - 0.5);
    
    // Buat balon dengan posisi random
    for (let i = 0; i < shuffledNumbers.length; i++) {
      newBubbles.push({
        id: i,
        number: shuffledNumbers[i],
        x: Math.random() * 70 + 15,  // 15% - 85%
        y: Math.random() * 55 + 20,   // 20% - 75%
      });
    }
    
    setBubbles(newBubbles);
    
    // Debug: pastikan jawaban benar ada di balon
    const hasCorrectAnswer = newBubbles.some(b => b.number === safeAnswer);
    if (!hasCorrectAnswer) {
      console.warn('Warning: Jawaban benar tidak ada di balon!', safeAnswer);
      // Fix: ganti balon pertama dengan jawaban benar
      if (newBubbles.length > 0) {
        newBubbles[0].number = safeAnswer;
        setBubbles([...newBubbles]);
      }
    }
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (bubble.number === currentQuestion.answer) {
      // Jawaban benar!
      const newScore = score + 10;
      setScore(newScore);
      setMessage('✅ Benar! +10 poin');
      playSound('correct');
      
      // Cek apakah sudah menang (skor 50)
      if (newScore >= 50) {
        setMessage('🎉 SELAMAT! Kamu hebat! 🎉');
        playSound('win');
        onComplete(newScore);
        return;
      }
      
      // Generate soal dan balon baru
      const newAnswer = generateNewQuestion();
      generateBubbles(newAnswer);
      
      // Hapus pesan setelah 1.5 detik
      setTimeout(() => setMessage(''), 1500);
    } else {
      // Jawaban salah - kurangi poin
      const newScore = Math.max(0, score - 5);
      setScore(newScore);
      setMessage(`❌ Salah! Jawabannya ${currentQuestion.answer}. -5 poin`);
      playSound('wrong');
      
      setTimeout(() => setMessage(''), 1500);
    }
  };

  // Inisialisasi game
  useEffect(() => {
    const firstAnswer = generateNewQuestion();
    generateBubbles(firstAnswer);
  }, []);

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-purple-600 mb-2">
          🎈 Skor: {score} / 50
        </div>
        <div className="text-2xl bg-gradient-to-r from-yellow-200 to-orange-200 inline-block px-8 py-4 rounded-2xl my-4 shadow-lg">
          🤔 {currentQuestion.text}
        </div>
        {message && (
          <div className={`text-lg font-bold ${message.includes('Benar') ? 'text-green-600' : 'text-red-600'} animate-bounce`}>
            {message}
          </div>
        )}
      </div>

      <div className="relative h-[400px] bg-gradient-to-b from-sky-200 to-sky-400 rounded-3xl overflow-hidden cursor-pointer">
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            onClick={() => handleBubbleClick(bubble)}
            className="absolute text-5xl cursor-pointer hover:scale-110 transition transform animate-float"
            style={{ 
              left: `${bubble.x}%`, 
              top: `${bubble.y}%`,
              animationDelay: `${bubble.id * 0.1}s`
            }}
          >
            🎈
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white drop-shadow-md">
              {bubble.number}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center mt-4 text-sm text-gray-600">
        💡 Klik balon yang angkanya sama dengan jawaban soal!
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-green-500 to-teal-500 h-full transition-all duration-500"
          style={{ width: `${(score / 50) * 100}%` }}
        />
      </div>

      <div className="text-center mt-3 text-xs text-gray-400">
        ✨ Setiap jawaban benar +10 poin, salah -5 poin ✨
      </div>
    </div>
  );
}