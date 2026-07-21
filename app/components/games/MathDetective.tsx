// components/games/MathDetective.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface MathDetectiveProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Case {
  id: number;
  title: string;
  story: string;
  clues: string[];
  questions: DetectiveQuestion[];
  suspect: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solved: boolean;
}

interface DetectiveQuestion {
  id: number;
  question: string;
  type: 'multiple' | 'input';
  options?: string[];
  answer: string;
  hint: string;
  points: number;
}

interface Evidence {
  id: number;
  name: string;
  emoji: string;
  found: boolean;
  description: string;
}

const CASES: Case[] = [
  {
    id: 1,
    title: "Misteri Kue Hilang",
    story: "🔍 Sebuah kue ulang tahun raksasa hilang dari toko kue Bu Maria! Ada 3 tersangka: si Kucing, si Tikus, dan si Burung. Kue tersebut dipotong menjadi 8 bagian sama besar. Saksi melihat 3/8 bagian dimakan Kucing, 1/4 bagian dimakan Tikus. Berapa bagian yang tersisa?",
    clues: [
      "Kue awalnya utuh (8/8 bagian)",
      "Kucing makan 3/8 bagian",
      "Tikus makan 1/4 = 2/8 bagian"
    ],
    questions: [
      {
        id: 1,
        question: "Berapa bagian kue yang sudah dimakan Kucing dan Tikus? (dalam pecahan per 8)",
        type: 'multiple',
        options: ['3/8', '5/8', '6/8', '4/8'],
        answer: '5/8',
        hint: "Samakan penyebut: 3/8 + 2/8 = ?",
        points: 20
      },
      {
        id: 2,
        question: "Berapa bagian kue yang tersisa? (dalam pecahan paling sederhana)",
        type: 'multiple',
        options: ['3/8', '2/8', '1/4', '3/4'],
        answer: '3/8',
        hint: "8/8 - 5/8 = 3/8, sederhanakan jika bisa",
        points: 30
      },
      {
        id: 3,
        question: "Jika 1 kue utuh harganya Rp 80.000, berapa harga kue yang hilang?",
        type: 'multiple',
        options: ['Rp 30.000', 'Rp 50.000', 'Rp 40.000', 'Rp 60.000'],
        answer: 'Rp 50.000',
        hint: "5/8 × Rp 80.000 = ?",
        points: 50
      }
    ],
    suspect: "Kucing dan Tikus bekerja sama!",
    difficulty: 'easy',
    solved: false
  },
  {
    id: 2,
    title: "Pencurian di Toko Mainan",
    story: "🎯 Toko mainan Pak Budi kebobolan! Pencuri mengambil 2/5 dari total 150 mainan. Polisi menemukan 3/10 mainan yang dicuri di rumah tersangka A, dan sisanya di rumah tersangka B. Berapa mainan di masing-masing rumah?",
    clues: [
      "Total mainan: 150 buah",
      "Yang dicuri: 2/5 × 150 mainan",
      "Tersangka A: 3/10 dari yang dicuri",
      "Sisanya di Tersangka B"
    ],
    questions: [
      {
        id: 1,
        question: "Berapa mainan yang dicuri seluruhnya?",
        type: 'input',
        answer: '60',
        hint: "2/5 × 150 = (2 × 150) ÷ 5",
        points: 25
      },
      {
        id: 2,
        question: "Berapa mainan di rumah Tersangka A?",
        type: 'multiple',
        options: ['15', '18', '20', '24'],
        answer: '18',
        hint: "3/10 × 60 = (3 × 60) ÷ 10",
        points: 35
      },
      {
        id: 3,
        question: "Berapa persen mainan yang ada di Tersangka B dari total yang dicuri?",
        type: 'multiple',
        options: ['60%', '70%', '75%', '80%'],
        answer: '70%',
        hint: "Tersangka B: 42 mainan. 42/60 × 100% = ?",
        points: 40
      }
    ],
    suspect: "Tersangka B menyimpan lebih banyak!",
    difficulty: 'medium',
    solved: false
  },
  {
    id: 3,
    title: "Misteri Bangun Datar",
    story: "📐 Di taman kota, ada taman berbentuk persegi panjang dengan panjang 24 meter dan lebar 16 meter. Di tengahnya ada kolam berbentuk lingkaran dengan diameter 14 meter. Sisa taman ditanami rumput. Petugas taman perlu menghitung luas rumput untuk membeli bibit.",
    clues: [
      "Luas taman = panjang × lebar",
      "Luas lingkaran = π × r² (π = 22/7)",
      "Diameter kolam = 14 m, jadi jari-jari = 7 m"
    ],
    questions: [
      {
        id: 1,
        question: "Berapa luas taman seluruhnya? (dalam m²)",
        type: 'input',
        answer: '384',
        hint: "24 × 16 = ?",
        points: 20
      },
      {
        id: 2,
        question: "Berapa luas kolam? (π = 22/7)",
        type: 'multiple',
        options: ['154 m²', '144 m²', '164 m²', '174 m²'],
        answer: '154 m²',
        hint: "22/7 × 7 × 7 = 22 × 7 = ?",
        points: 40
      },
      {
        id: 3,
        question: "Berapa luas rumput yang ditanami?",
        type: 'multiple',
        options: ['220 m²', '230 m²', '240 m²', '250 m²'],
        answer: '230 m²',
        hint: "Luas taman - luas kolam = 384 - 154",
        points: 40
      }
    ],
    suspect: "Dibutuhkan 230 m² bibit rumput!",
    difficulty: 'hard',
    solved: false
  },
  {
    id: 4,
    title: "Grafik Penjualan Misterius",
    story: "📊 Sebuah toko es krim mencatat penjualan selama seminggu: Senin 45 cup, Selasa 30 cup, Rabu 50 cup, Kamis 35 cup, Jumat 65 cup, Sabtu 80 cup, Minggu 100 cup. Pemilik toko curiga ada yang mencuri uang di hari dengan penjualan di bawah rata-rata.",
    clues: [
      "Hitung rata-rata penjualan harian",
      "Cari hari dengan penjualan di bawah rata-rata",
      "Hitung total kerugian jika 20% uang dicuri"
    ],
    questions: [
      {
        id: 1,
        question: "Berapa rata-rata penjualan per hari? (bulatkan ke bawah)",
        type: 'input',
        answer: '57',
        hint: "Jumlahkan semua ÷ 7 hari",
        points: 30
      },
      {
        id: 2,
        question: "Hari apa saja yang penjualannya di bawah rata-rata?",
        type: 'multiple',
        options: ['Senin & Selasa', 'Selasa & Kamis', 'Senin, Selasa, Kamis', 'Senin & Kamis'],
        answer: 'Senin, Selasa, Kamis',
        hint: "45, 30, dan 35 di bawah 57",
        points: 30
      },
      {
        id: 3,
        question: "Jika harga 1 cup Rp 5.000, berapa total uang yang dicuri (20%) dari hari-hari tersebut?",
        type: 'multiple',
        options: ['Rp 100.000', 'Rp 110.000', 'Rp 120.000', 'Rp 130.000'],
        answer: 'Rp 110.000',
        hint: "(45+30+35) × Rp 5.000 × 20%",
        points: 40
      }
    ],
    suspect: "Pencuri beraksi di hari sepi!",
    difficulty: 'medium',
    solved: false
  },
  {
    id: 5,
    title: "Skala Peta Harta Karun",
    story: "🗺️ Sebuah peta harta karun memiliki skala 1 : 250.000. Jarak dari titik start ke gua di peta adalah 8 cm. Dari gua ke pantai 12 cm. Lalu dari pantai ke lokasi harta 5 cm. Berapa km total perjalanan sebenarnya?",
    clues: [
      "Skala 1 : 250.000 artinya 1 cm di peta = 250.000 cm sebenarnya",
      "250.000 cm = 2,5 km",
      "Total jarak di peta = 8 + 12 + 5 = 25 cm"
    ],
    questions: [
      {
        id: 1,
        question: "Berapa km jarak sebenarnya dari start ke gua?",
        type: 'multiple',
        options: ['15 km', '20 km', '25 km', '30 km'],
        answer: '20 km',
        hint: "8 × 2,5 km = ?",
        points: 30
      },
      {
        id: 2,
        question: "Berapa total jarak di peta?",
        type: 'input',
        answer: '25',
        hint: "8 + 12 + 5 = ?",
        points: 20
      },
      {
        id: 3,
        question: "Berapa km total perjalanan sebenarnya?",
        type: 'multiple',
        options: ['60,5 km', '62,5 km', '65 km', '67,5 km'],
        answer: '62,5 km',
        hint: "25 × 2,5 km = ?",
        points: 50
      }
    ],
    suspect: "Harta karun ditemukan setelah 62,5 km!",
    difficulty: 'hard',
    solved: false
  }
];

export default function MathDetective({ onComplete }: MathDetectiveProps) {
  const [cases, setCases] = useState<Case[]>(CASES);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [caseSolved, setCaseSolved] = useState(false);
  const [gamePhase, setGamePhase] = useState<'briefing' | 'investigation' | 'questioning' | 'resolution' | 'complete'>('briefing');
  const [solvedCases, setSolvedCases] = useState<number[]>([]);

  const startCase = (caseData: Case) => {
    setCurrentCase(caseData);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalPoints(caseData.questions.reduce((sum, q) => sum + q.points, 0));
    setEvidence([]);
    setCaseSolved(false);
    setGamePhase('briefing');
  };

  const startInvestigation = () => {
    setGamePhase('investigation');
  };

  const handleAnswer = () => {
    if (!currentCase) return;
    
    const question = currentCase.questions[currentQuestionIndex];
    const answer = question.type === 'input' ? inputAnswer : selectedAnswer;
    
    if (!answer) return;
    
    const correct = answer.toString().toLowerCase() === question.answer.toString().toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const pointsEarned = hintUsed ? Math.floor(question.points * 0.5) : question.points;
      setScore(prev => prev + pointsEarned);
      
      // Add evidence
      const newEvidence: Evidence = {
        id: Date.now(),
        name: `Bukti #${currentQuestionIndex + 1}`,
        emoji: ['🔍', '📝', '🧩', '🔑', '💡'][currentQuestionIndex],
        found: true,
        description: `Berhasil menjawab: ${question.question}`
      };
      setEvidence(prev => [...prev, newEvidence]);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < currentCase.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setInputAnswer('');
        setShowFeedback(false);
        setShowHint(false);
        setHintUsed(false);
      } else {
        setCaseSolved(true);
        setGamePhase('resolution');
        setSolvedCases(prev => [...prev, currentCase.id]);
        
        // Update case as solved
        setCases(prev => prev.map(c => 
          c.id === currentCase.id ? { ...c, solved: true } : c
        ));
      }
    }, 2000);
  };

  const calculateFinalStars = () => {
    const totalSolved = solvedCases.length;
    if (totalSolved >= 4) return 3;
    if (totalSolved >= 2) return 2;
    return 1;
  };

  const finishGame = () => {
    setGamePhase('complete');
    const stars = calculateFinalStars();
    onComplete(stars, { solvedCases: solvedCases.length, totalCases: cases.length });
  };

  const renderBriefing = () => {
    if (!currentCase) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 text-white rounded-2xl p-6">
          <h3 className="text-2xl font-bold mb-2">📋 {currentCase.title}</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
            currentCase.difficulty === 'easy' ? 'bg-green-500' :
            currentCase.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {currentCase.difficulty === 'easy' ? '⭐ Mudah' :
             currentCase.difficulty === 'medium' ? '⭐⭐ Sedang' : '⭐⭐⭐ Sulit'}
          </div>
          <p className="text-gray-200 mb-4">{currentCase.story}</p>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-bold mb-2">🔑 Petunjuk Awal:</h4>
            <ul className="space-y-2">
              {currentCase.clues.map((clue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-400">▶</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <button
          onClick={startInvestigation}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl font-bold text-lg hover:scale-105 transition"
        >
          🔍 Mulai Investigasi!
        </button>
      </div>
    );
  };

  const renderQuestioning = () => {
    if (!currentCase) return null;
    
    const question = currentCase.questions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentQuestionIndex / currentCase.questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-600">
            {currentQuestionIndex + 1}/{currentCase.questions.length}
          </span>
        </div>
        
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🤔</span>
            <div>
              <h3 className="font-bold text-lg mb-2">Pertanyaan Detektif:</h3>
              <p className="text-gray-800">{question.question}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Poin: {question.points}</span>
            {hintUsed && <span className="text-sm text-orange-500">⚠️ Poin berkurang 50%</span>}
          </div>
          
          {/* Answer Area */}
          {question.type === 'multiple' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(option)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white scale-105'
                      : 'bg-gray-50 hover:bg-blue-50 border-2 border-gray-200'
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                placeholder="Ketik jawabanmu..."
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg text-center focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
              />
            </div>
          )}
          
          {/* Hint */}
          <div className="mt-4">
            <button
              onClick={() => {
                setShowHint(!showHint);
                if (!showHint) setHintUsed(true);
              }}
              className="text-sm text-orange-500 hover:text-orange-700 underline"
            >
              {showHint ? 'Sembunyikan petunjuk' : '💡 Butuh petunjuk? (-50% poin)'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                {question.hint}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleAnswer}
            disabled={!selectedAnswer && !inputAnswer}
            className={`w-full mt-4 p-3 rounded-xl font-bold text-white transition-all ${
              selectedAnswer || inputAnswer
                ? 'bg-gradient-to-r from-green-400 to-green-600 hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            ✅ Jawab & Kumpulkan Bukti
          </button>
        </div>
        
        {/* Evidence Collected */}
        {evidence.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold mb-2">🔍 Bukti Terkumpul:</h4>
            <div className="flex flex-wrap gap-2">
              {evidence.map((ev, idx) => (
                <div key={idx} className="bg-white rounded-lg p-2 shadow text-center">
                  <div className="text-2xl">{ev.emoji}</div>
                  <div className="text-xs">{ev.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResolution = () => {
    if (!currentCase) return null;
    
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <h3 className="text-2xl font-bold text-green-600">Kasus Terpecahkan!</h3>
        
        <div className="bg-green-50 rounded-2xl p-6">
          <p className="text-lg font-bold mb-2">{currentCase.suspect}</p>
          <p className="text-gray-600">
            Skor: {score} / {totalPoints} poin
          </p>
          
          <div className="mt-4 flex justify-center gap-2 text-2xl">
            {evidence.map((ev, idx) => (
              <span key={idx} title={ev.description}>{ev.emoji}</span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              const unsolvedCases = cases.filter(c => !solvedCases.includes(c.id));
              if (unsolvedCases.length > 0) {
                startCase(unsolvedCases[0]);
              } else {
                finishGame();
              }
            }}
            className="flex-1 bg-blue-500 text-white p-3 rounded-xl font-bold hover:scale-105 transition"
          >
            {cases.filter(c => !solvedCases.includes(c.id)).length > 0 
              ? '🔍 Kasus Berikutnya' 
              : '🏆 Selesaikan Game'}
          </button>
        </div>
      </div>
    );
  };

  const renderCaseSelection = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center mb-4">📋 Pilih Kasus:</h3>
        {cases.map(caseData => (
          <button
            key={caseData.id}
            onClick={() => startCase(caseData)}
            disabled={caseData.solved}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              caseData.solved
                ? 'bg-green-100 border-2 border-green-300'
                : 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {caseData.solved ? '✅' : 
                 caseData.difficulty === 'easy' ? '🔍' :
                 caseData.difficulty === 'medium' ? '🔎' : '🔬'}
              </span>
              <div>
                <h4 className="font-bold">{caseData.title}</h4>
                <p className="text-sm text-gray-500">
                  {caseData.difficulty === 'easy' ? 'Mudah' :
                   caseData.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                  {' • '}{caseData.questions.length} pertanyaan
                </p>
              </div>
            </div>
          </button>
        ))}
        
        {solvedCases.length > 0 && (
          <button
            onClick={finishGame}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-xl font-bold hover:scale-105 transition"
          >
            🏆 Selesaikan Semua Kasus ({solvedCases.length}/{cases.length} terpecahkan)
          </button>
        )}
      </div>
    );
  };

  if (gamePhase === 'complete') {
    const stars = calculateFinalStars();
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2 text-yellow-600">Detektif Hebat!</h2>
        <p className="text-lg mb-2">
          Kasus Terpecahkan: {solvedCases.length}/{cases.length}
        </p>
        <div className="flex justify-center gap-2 text-4xl mb-4">
          {stars >= 1 && '⭐'}
          {stars >= 2 && '⭐'}
          {stars >= 3 && '⭐'}
        </div>
        <button
          onClick={() => {
            setCases(CASES.map(c => ({ ...c, solved: false })));
            setSolvedCases([]);
            setGamePhase('briefing');
            setCurrentCase(null);
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition"
        >
          🔄 Main Lagi
        </button>
      </div>
    );
  }

  if (!currentCase) {
    return renderCaseSelection();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-purple-600">
          {currentCase.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">⭐</span>
          <span className="font-bold">{score}</span>
        </div>
      </div>
      
      {/* Game Phases */}
      {gamePhase === 'briefing' && renderBriefing()}
      {gamePhase === 'investigation' && (
        <div>
          {renderQuestioning()}
        </div>
      )}
      {gamePhase === 'resolution' && renderResolution()}
      
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl text-center ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="text-5xl mb-2">
              {isCorrect ? '🎉' : '❌'}
            </div>
            <p className={`text-xl font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? 'Bukti Ditemukan!' : 'Belum Tepat'}
            </p>
            {isCorrect && (
              <p className="text-sm mt-2">
                +{hintUsed ? Math.floor(currentCase!.questions[currentQuestionIndex].points * 0.5) : currentCase!.questions[currentQuestionIndex].points} poin
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}