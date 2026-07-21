// components/games/MathCraft.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface MathCraftProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Recipe {
  id: number;
  name: string;
  emoji: string;
  ingredients: { item: string; emoji: string; count: number }[];
  result: string;
  emoji_result: string;
  questions: CraftQuestion[];
  built: boolean;
}

interface CraftQuestion {
  id: number;
  question: string;
  answer: number;
  type: 'addition' | 'subtraction' | 'multiplication' | 'comparison';
  points: number;
}

interface Inventory {
  [key: string]: number;
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    name: "Rumah Kayu",
    emoji: "🏠",
    ingredients: [
      { item: "kayu", emoji: "🪵", count: 5 },
      { item: "batu", emoji: "🪨", count: 3 },
    ],
    result: "Rumah Kayu Sederhana",
    emoji_result: "🏠",
    questions: [
      { id: 1, question: "🪵 Kamu punya 8 kayu, butuh 5. Sisa berapa?", answer: 3, type: 'subtraction', points: 10 },
      { id: 2, question: "🪨 Batu butuh 3, kamu ambil 2 kali @2 batu. Cukup?", answer: 1, type: 'comparison', points: 15 },
      { id: 3, question: "🧱 Total bahan yang dibutuhkan (kayu + batu)?", answer: 8, type: 'addition', points: 10 },
    ],
    built: false,
  },
  {
    id: 2,
    name: "Taman Bunga",
    emoji: "🌻",
    ingredients: [
      { item: "bibit", emoji: "🌱", count: 4 },
      { item: "air", emoji: "💧", count: 6 },
      { item: "pupuk", emoji: "🟤", count: 2 },
    ],
    result: "Taman Bunga Indah",
    emoji_result: "🌻",
    questions: [
      { id: 1, question: "🌱 Bibit ditanam 2 baris @2 bibit. Total bibit?", answer: 4, type: 'multiplication', points: 10 },
      { id: 2, question: "💧 Air 6 ember, disiram 3 kali @? ember agar habis?", answer: 2, type: 'subtraction', points: 15 },
      { id: 3, question: "🟤 Pupuk 2 kantong, @3 kg. Total kg?", answer: 6, type: 'multiplication', points: 10 },
    ],
    built: false,
  },
  {
    id: 3,
    name: "Jembatan Batu",
    emoji: "🌉",
    ingredients: [
      { item: "batu", emoji: "🪨", count: 8 },
      { item: "pasir", emoji: "🏖️", count: 4 },
      { item: "besi", emoji: "🔩", count: 6 },
    ],
    result: "Jembatan Batu Kokoh",
    emoji_result: "🌉",
    questions: [
      { id: 1, question: "🪨 Batu 8, dibagi 2 sisi jembatan. @berapa?", answer: 4, type: 'subtraction', points: 10 },
      { id: 2, question: "🏖️ Pasir 4 karung, @5 kg. Total kg?", answer: 20, type: 'multiplication', points: 15 },
      { id: 3, question: "🔩 Besi 6 + batu 8 = berapa total?", answer: 14, type: 'addition', points: 10 },
    ],
    built: false,
  },
  {
    id: 4,
    name: "Perahu Layar",
    emoji: "⛵",
    ingredients: [
      { item: "kayu", emoji: "🪵", count: 7 },
      { item: "kain", emoji: "🧵", count: 3 },
      { item: "tali", emoji: "🪢", count: 5 },
    ],
    result: "Perahu Layar Hebat",
    emoji_result: "⛵",
    questions: [
      { id: 1, question: "🪵 Kayu 7 + kain 3 + tali 5 = total?", answer: 15, type: 'addition', points: 15 },
      { id: 2, question: "🧵 Kain 3 meter, dipotong @1 meter. Berapa potongan?", answer: 3, type: 'subtraction', points: 10 },
      { id: 3, question: "🪢 Tali 5 × 2 simpul = berapa?", answer: 10, type: 'multiplication', points: 10 },
    ],
    built: false,
  },
  {
    id: 5,
    name: "Menara Tinggi",
    emoji: "🗼",
    ingredients: [
      { item: "bata", emoji: "🧱", count: 12 },
      { item: "semen", emoji: "🪣", count: 4 },
      { item: "besi", emoji: "🔩", count: 8 },
    ],
    result: "Menara Pencakar Langit",
    emoji_result: "🗼",
    questions: [
      { id: 1, question: "🧱 Bata disusun 3 tingkat @4 bata. Total?", answer: 12, type: 'multiplication', points: 10 },
      { id: 2, question: "🪣 Semen 4 ember, butuh 2× lipat. Berapa?", answer: 8, type: 'multiplication', points: 15 },
      { id: 3, question: "🔩 Besi 8 - semen 4 = selisih?", answer: 4, type: 'subtraction', points: 10 },
    ],
    built: false,
  },
];

const COLLECTION_ITEMS = [
  { item: "kayu", emoji: "🪵", name: "Kayu" },
  { item: "batu", emoji: "🪨", name: "Batu" },
  { item: "bibit", emoji: "🌱", name: "Bibit" },
  { item: "air", emoji: "💧", name: "Air" },
  { item: "pupuk", emoji: "🟤", name: "Pupuk" },
  { item: "pasir", emoji: "🏖️", name: "Pasir" },
  { item: "besi", emoji: "🔩", name: "Besi" },
  { item: "kain", emoji: "🧵", name: "Kain" },
  { item: "tali", emoji: "🪢", name: "Tali" },
  { item: "bata", emoji: "🧱", name: "Bata" },
  { item: "semen", emoji: "🪣", name: "Semen" },
];

export default function MathCraft({ onComplete }: MathCraftProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [inventory, setInventory] = useState<Inventory>({});
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [builtItems, setBuiltItems] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<'gathering' | 'crafting' | 'complete'>('gathering');
  const [gatheringItem, setGatheringItem] = useState<{ item: string; emoji: string; count: number } | null>(null);
  const [showCollection, setShowCollection] = useState(false);
  const [combo, setCombo] = useState(0);

  const handleGather = useCallback((item: string, emoji: string) => {
    const count = Math.floor(Math.random() * 3) + 1; // Random 1-3
    setGatheringItem({ item, emoji, count });
    
    setInventory(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + count,
    }));
    
    setTimeout(() => {
      setGatheringItem(null);
    }, 1500);
  }, []);

  const startCrafting = useCallback((recipe: Recipe) => {
    // Check if enough materials
    const hasEnough = recipe.ingredients.every(
      ing => (inventory[ing.item] || 0) >= ing.count
    );
    
    if (!hasEnough) {
      alert('Bahan tidak cukup! Kumpulkan dulu ya...');
      return;
    }
    
    setCurrentRecipe(recipe);
    setCurrentQuestionIndex(0);
    setGamePhase('crafting');
  }, [inventory]);

  const handleAnswer = useCallback((answer: number) => {
    if (!currentRecipe) return;
    
    const question = currentRecipe.questions[currentQuestionIndex];
    setSelectedAnswer(answer);
    const correct = answer === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + question.points);
      setCombo(prev => prev + 1);
    } else {
      setCombo(0);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < currentRecipe.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Recipe complete!
        const updatedRecipes = recipes.map(r =>
          r.id === currentRecipe.id ? { ...r, built: true } : r
        );
        setRecipes(updatedRecipes);
        
        // Consume ingredients
        const newInventory = { ...inventory };
        currentRecipe.ingredients.forEach(ing => {
          newInventory[ing.item] = (newInventory[ing.item] || 0) - ing.count;
        });
        setInventory(newInventory);
        
        setBuiltItems(prev => [...prev, currentRecipe.emoji_result]);
        setGamePhase('gathering');
        setCurrentRecipe(null);
        setShowFeedback(false);
        
        // Check if all recipes built
        if (updatedRecipes.every(r => r.built)) {
          setTimeout(() => setGamePhase('complete'), 1000);
        }
      }
    }, 1500);
  }, [currentRecipe, currentQuestionIndex, inventory, recipes]);

  const handleComplete = useCallback(() => {
    const stars = builtItems.length >= 5 ? 3 : builtItems.length >= 3 ? 2 : 1;
    onComplete(stars, { score, builtItems: builtItems.length });
  }, [score, builtItems, onComplete]);

  const generateOptions = (correct: number): number[] => {
    const options = new Set<number>([correct]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const option = Math.random() > 0.5 ? correct + offset : Math.max(0, correct - offset);
      options.add(option);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  if (gamePhase === 'complete') {
    const stars = builtItems.length >= 5 ? 3 : builtItems.length >= 3 ? 2 : 1;
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎊</div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Semua Berhasil Dibangun!</h2>
        <div className="flex justify-center gap-3 text-4xl my-4">
          {builtItems.map((item, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
              {item}
            </span>
          ))}
        </div>
        <p className="text-lg">Skor: {score}</p>
        <div className="flex justify-center gap-2 text-4xl mt-4">
          {stars >= 1 && '⭐'}
          {stars >= 2 && '⭐'}
          {stars >= 3 && '⭐'}
        </div>
        <button onClick={handleComplete} className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl">
          🏆 Klaim Hadiah
        </button>
      </div>
    );
  }

  if (gamePhase === 'crafting' && currentRecipe) {
    const question = currentRecipe.questions[currentQuestionIndex];
    const options = generateOptions(question.answer);
    
    return (
      <div className="max-w-2xl mx-auto">
        {/* Crafting Progress */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setGamePhase('gathering');
              setCurrentRecipe(null);
            }}
            className="text-sm bg-gray-200 px-3 py-1 rounded-full"
          >
            ← Kembali
          </button>
          <div className="text-center">
            <span className="text-3xl">{currentRecipe.emoji}</span>
            <p className="font-bold">{currentRecipe.name}</p>
          </div>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1}/{currentRecipe.questions.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
            style={{ width: `${(currentQuestionIndex / currentRecipe.questions.length) * 100}%` }}
          />
        </div>
        
        {/* Question Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{currentRecipe.emoji}</div>
            <h3 className="text-xl font-bold text-gray-800">{question.question}</h3>
            <p className="text-sm text-gray-500 mt-1">+{question.points} poin</p>
          </div>
          
          {/* Crafting table visual */}
          <div className="bg-yellow-100 rounded-xl p-4 mb-4 flex justify-center gap-4">
            {currentRecipe.ingredients.map((ing, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl">{ing.emoji}</div>
                <div className="text-xs font-bold">×{ing.count}</div>
              </div>
            ))}
            <div className="text-3xl self-center">=</div>
            <div className="text-5xl self-center">{currentRecipe.emoji_result}</div>
          </div>
        </div>
        
        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !showFeedback && handleAnswer(option)}
              disabled={showFeedback}
              className={`p-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
                showFeedback && option === question.answer
                  ? 'bg-green-500 text-white scale-110'
                  : showFeedback && option === selectedAnswer
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
          <div className={`mt-4 p-4 rounded-xl text-center ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className="text-2xl">{isCorrect ? '🎉' : '❌'}</span>
            <p className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? `+${question.points} Poin!` : 'Coba lagi!'}
            </p>
            {combo >= 3 && isCorrect && (
              <p className="text-yellow-600 font-bold mt-1">🔥 Combo x{combo}!</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Gathering Phase
  return (
    <div className="max-w-4xl mx-auto">
      {/* Score & Built Items */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-yellow-100 rounded-full px-4 py-2 font-bold">
          ⭐ {score}
        </div>
        <div className="flex gap-2 text-2xl">
          {builtItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
          {Array.from({ length: RECIPES.length - builtItems.length }).map((_, i) => (
            <span key={i} className="opacity-30">❓</span>
          ))}
        </div>
        <button
          onClick={() => setShowCollection(!showCollection)}
          className="bg-blue-100 rounded-full px-4 py-2 font-bold text-sm"
        >
          🎒 Inventory
        </button>
      </div>
      
      {/* Gathering Area */}
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">🌍 Kumpulkan Bahan</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {COLLECTION_ITEMS.map((item) => (
            <button
              key={item.item}
              onClick={() => handleGather(item.item, item.emoji)}
              className="bg-white rounded-xl p-3 text-center hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-3xl mb-1">{item.emoji}</div>
              <div className="text-xs font-bold">{item.name}</div>
              <div className="text-sm text-green-600">
                ×{inventory[item.item] || 0}
              </div>
            </button>
          ))}
        </div>
        
        {/* Gathering Animation */}
        {gatheringItem && (
          <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 text-center animate-bounce">
            <div className="text-5xl mb-2">{gatheringItem.emoji}</div>
            <p className="font-bold text-lg">Dapat {gatheringItem.count}x {gatheringItem.emoji}!</p>
          </div>
        )}
      </div>
      
      {/* Collection/Inventory Modal */}
      {showCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">🎒 Inventory</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(inventory).map(([item, count]) => {
                const itemData = COLLECTION_ITEMS.find(i => i.item === item);
                return count > 0 ? (
                  <div key={item} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-2xl">{itemData?.emoji}</span>
                    <span className="font-bold">×{count}</span>
                  </div>
                ) : null;
              })}
            </div>
            <button
              onClick={() => setShowCollection(false)}
              className="w-full bg-gray-200 p-2 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      
      {/* Recipes */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">🔨 Resep Bangunan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => {
            const canBuild = recipe.ingredients.every(
              ing => (inventory[ing.item] || 0) >= ing.count
            );
            
            return (
              <button
                key={recipe.id}
                onClick={() => !recipe.built && startCrafting(recipe)}
                disabled={recipe.built}
                className={`p-4 rounded-2xl text-left transition-all ${
                  recipe.built
                    ? 'bg-green-100 border-2 border-green-300 opacity-70'
                    : canBuild
                    ? 'bg-white border-2 border-yellow-400 hover:shadow-xl hover:scale-105 cursor-pointer'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{recipe.built ? '✅' : recipe.emoji}</span>
                  <div>
                    <h4 className="font-bold">{recipe.name}</h4>
                    <p className="text-xs text-gray-500">
                      {recipe.built ? 'Selesai!' : canBuild ? 'Bisa dibuat!' : 'Bahan kurang'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i} className="bg-gray-100 rounded-full px-2 py-1">
                      {ing.emoji} ×{ing.count}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}