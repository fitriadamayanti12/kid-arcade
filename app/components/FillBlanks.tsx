// app/components/FillBlanks.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface FillBlanksProps {
    playerName: string;
    onComplete: (stars: number, score: number) => void;
}

interface Question {
    id: number;
    word: string;
    display_word: string;  // ← snake_case sesuai database
    answer: string;
    hint: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;      // ← tambahkan category
    points: number;
}

export default function FillBlanks({ playerName, onComplete }: FillBlanksProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [completed, setCompleted] = useState(false);
    const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [loading, setLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const { playSound } = useSoundEffect();

    // Load questions from Supabase
    const loadQuestions = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('questions')
                .select('*')
                .eq('is_active', true);

            if (difficultyFilter !== 'all') {
                query = query.eq('difficulty', difficultyFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error loading questions:', error);
                return;
            }

            if (data) {
                setQuestions(data);
                setTotalQuestions(data.length);
                setUsedQuestions(new Set());
                setScore(0);
                setCompleted(false);
                if (data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setCurrentQuestion(data[randomIndex]);
                }
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [difficultyFilter]);

    // Load player's answered questions
    const loadPlayerProgress = useCallback(async () => {
        const { data } = await supabase
            .from('player_questions')
            .select('question_id')
            .eq('player_name', playerName)
            .eq('is_correct', true);

        if (data) {
            const answeredIds = new Set(data.map(d => d.question_id));
            setUsedQuestions(answeredIds);
        }
    }, [playerName]);

    // Save answer to database
    const saveAnswer = async (questionId: number, isCorrect: boolean) => {
        await supabase
            .from('player_questions')
            .upsert({
                player_name: playerName,
                question_id: questionId,
                is_correct: isCorrect,
                answered_at: new Date()
            }, {
                onConflict: 'player_name,question_id'
            });
    };

    useEffect(() => {
        loadQuestions();
        loadPlayerProgress();
    }, [loadQuestions, loadPlayerProgress]);

    const getRandomQuestion = () => {
        const available = questions.filter(q => !usedQuestions.has(q.id));
        if (available.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    };

    const loadNewQuestion = () => {
        const question = getRandomQuestion();
        if (question) {
            setCurrentQuestion(question);
            setUserAnswer('');
            setShowHint(false);
            setFeedback('');
            playSound('click');
        } else {
            setCompleted(true);
            const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
            let stars = 1;
            if (percentage >= 80) stars = 3;
            else if (percentage >= 60) stars = 2;
            onComplete(stars, score);
        }
    };

    const normalizeAnswer = (answer: string) => {
        return answer
            .toUpperCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^A-Z]/g, '');
    };

    const checkAnswer = async () => {
        if (!currentQuestion) return;

        const normalizedUser = normalizeAnswer(userAnswer);
        const normalizedCorrect = normalizeAnswer(currentQuestion.answer);

        if (normalizedUser === normalizedCorrect) {
            const newScore = score + (currentQuestion.points || 10);
            setScore(newScore);
            setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));
            await saveAnswer(currentQuestion.id, true);
            setFeedback(`✅ Benar! +${currentQuestion.points || 10} poin`);
            playSound('correct');

            setTimeout(() => {
                loadNewQuestion();
            }, 1500);
        } else {
            setFeedback(`❌ Salah! Jawaban yang benar: ${currentQuestion.answer}`);
            await saveAnswer(currentQuestion.id, false);
            playSound('wrong');
            setTimeout(() => setFeedback(''), 2000);
        }
    };

    const startNewGame = () => {
        setUsedQuestions(new Set());
        setScore(0);
        setCompleted(false);
        setUserAnswer('');
        setShowHint(false);
        setFeedback('');
        playSound('click');
        loadQuestions();
    };

    if (loading) {
        return (
            <div className="p-3 sm:p-4 md:p-6 text-center">
                <div className="animate-pulse text-3xl sm:text-4xl md:text-5xl">📖</div>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-4">Memuat soal...</p>
            </div>
        );
    }

    if (completed) {
        const percentage = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
        return (
            <div className="p-3 sm:p-4 md:p-6 text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 mb-2">Game Selesai!</h2>
                <p className="text-sm sm:text-base mb-2">Kamu menjawab {usedQuestions.size} dari {totalQuestions} soal dengan benar</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Total Skor: {score} poin</p>
                <button
                    onClick={startNewGame}
                    className="bg-teal-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:bg-teal-600 transition"
                >
                    🔄 Main Lagi
                </button>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="p-3 sm:p-4 md:p-6 text-center">
                <p className="text-gray-500 text-sm sm:text-base">Tidak ada soal tersedia</p>
                <button
                    onClick={loadQuestions}
                    className="mt-3 sm:mt-4 bg-teal-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
                >
                    🔄 Muat Ulang
                </button>
            </div>
        );
    }

    const progressPercent = totalQuestions > 0 ? (usedQuestions.size / totalQuestions) * 100 : 0;

    return (
        <div className="p-3 sm:p-4 md:p-6">
            <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600 mb-2">✏️ Lengkapi Kata yang Hilang</h2>
                <p className="text-xs sm:text-sm text-gray-600">Isi huruf yang tepat untuk melengkapi kata!</p>
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center">
                <button
                    onClick={() => setDifficultyFilter('all')}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold transition ${difficultyFilter === 'all'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    📚 Semua
                </button>
                <button
                    onClick={() => setDifficultyFilter('easy')}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold transition ${difficultyFilter === 'easy'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    🌱 Mudah
                </button>
                <button
                    onClick={() => setDifficultyFilter('medium')}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold transition ${difficultyFilter === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    ⚡ Sedang
                </button>
                <button
                    onClick={() => setDifficultyFilter('hard')}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold transition ${difficultyFilter === 'hard'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                >
                    🔥 Sulit
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 sm:mb-6">
                <div className="flex justify-between text-[10px] sm:text-xs text-gray-600 mb-1">
                    <span>Soal: {usedQuestions.size + 1} / {totalQuestions}</span>
                    <span>Skor: {score} ⭐</span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-teal-400 to-teal-600 h-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-xl">
                <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2">
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-200 capitalize">
                            {currentQuestion.category || 'umum'}
                        </span>
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${currentQuestion.difficulty === 'easy' ? 'bg-green-200' :
                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                            }`}>
                            {currentQuestion.difficulty === 'easy' && '🌱 Mudah'}
                            {currentQuestion.difficulty === 'medium' && '⚡ Sedang'}
                            {currentQuestion.difficulty === 'hard' && '🔥 Sulit'}
                        </span>
                    </div>

                    <div className="text-xl sm:text-3xl md:text-5xl font-mono font-bold tracking-wider text-teal-700 mb-3 sm:mb-4 break-words">
                        {currentQuestion.display_word.split('').map((char, i) => (
                            <span key={i} className={char === '_' ? 'text-red-500 underline decoration-wavy' : ''}>
                                {char}
                            </span>
                        ))}
                    </div>

                    <div className="mb-3 sm:mb-4">
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="text-xs sm:text-sm text-teal-500 hover:text-teal-700 underline"
                        >
                            {showHint ? 'Sembunyikan petunjuk' : '🔍 Butuh petunjuk?'}
                        </button>
                        {showHint && (
                            <div className="mt-2 p-2 sm:p-3 bg-yellow-100 rounded-lg text-xs sm:text-sm">
                                💡 Petunjuk: {currentQuestion.hint}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-3 sm:mt-4">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') checkAnswer();
                            }}
                            placeholder="Jawaban..."
                            className="px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl w-full sm:w-48 md:w-64 text-center text-base sm:text-lg font-bold focus:outline-none focus:border-teal-400"
                            autoFocus
                        />
                        <button
                            onClick={checkAnswer}
                            className="bg-teal-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:bg-teal-600 transition"
                        >
                            Jawab ✅
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className={`text-center p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base ${feedback.includes('Benar') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {feedback}
                </div>
            )}

            <div className="text-center text-[10px] sm:text-xs text-gray-400">
                💡 Ketik huruf yang hilang, lalu tekan Enter
            </div>
        </div>
    );
}