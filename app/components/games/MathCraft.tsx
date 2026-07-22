// app/components/games/MathCraft.tsx
'use client';

import { useState, useCallback } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathCraftProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Recipe {
  id: number; name: string; emoji: string;
  ingredients: { item: string; emoji: string; count: number }[];
  result: string; emojiResult: string;
  questions: { id: number; question: string; answer: number; points: number }[];
  built: boolean;
}

const RECIPES: Recipe[] = [
  { id: 1, name: "Rumah Kayu", emoji: "🏠", ingredients: [{ item: "kayu", emoji: "🪵", count: 5 }, { item: "batu", emoji: "🪨", count: 3 }], result: "Rumah Kayu Sederhana", emojiResult: "🏠", questions: [{ id: 1, question: "🪵 Kamu punya 8 kayu, butuh 5. Sisa?", answer: 3, points: 10 }, { id: 2, question: "🪨 Batu 3, kamu ambil 2×2. Cukup?", answer: 1, points: 15 }, { id: 3, question: "🧱 Total kayu + batu?", answer: 8, points: 10 }], built: false },
  { id: 2, name: "Taman Bunga", emoji: "🌻", ingredients: [{ item: "bibit", emoji: "🌱", count: 4 }, { item: "air", emoji: "💧", count: 6 }, { item: "pupuk", emoji: "🟤", count: 2 }], result: "Taman Bunga Indah", emojiResult: "🌻", questions: [{ id: 1, question: "🌱 2 baris × 2 bibit = ?", answer: 4, points: 10 }, { id: 2, question: "💧 6 ember ÷ 3 kali = ?", answer: 2, points: 15 }, { id: 3, question: "🟤 2 kantong × 3 kg = ?", answer: 6, points: 10 }], built: false },
  { id: 3, name: "Jembatan Batu", emoji: "🌉", ingredients: [{ item: "batu", emoji: "🪨", count: 8 }, { item: "pasir", emoji: "🏖️", count: 4 }, { item: "besi", emoji: "🔩", count: 6 }], result: "Jembatan Batu Kokoh", emojiResult: "🌉", questions: [{ id: 1, question: "🪨 8 batu ÷ 2 sisi = ?", answer: 4, points: 10 }, { id: 2, question: "🏖️ 4 × 5 kg = ?", answer: 20, points: 15 }, { id: 3, question: "🔩 6 + 🪨 8 = ?", answer: 14, points: 10 }], built: false },
  { id: 4, name: "Perahu Layar", emoji: "⛵", ingredients: [{ item: "kayu", emoji: "🪵", count: 7 }, { item: "kain", emoji: "🧵", count: 3 }, { item: "tali", emoji: "🪢", count: 5 }], result: "Perahu Layar Hebat", emojiResult: "⛵", questions: [{ id: 1, question: "🪵7 + 🧵3 + 🪢5 = ?", answer: 15, points: 15 }, { id: 2, question: "🧵 3m ÷ 1m = ?", answer: 3, points: 10 }, { id: 3, question: "🪢 5 × 2 = ?", answer: 10, points: 10 }], built: false },
  { id: 5, name: "Menara Tinggi", emoji: "🗼", ingredients: [{ item: "bata", emoji: "🧱", count: 12 }, { item: "semen", emoji: "🪣", count: 4 }, { item: "besi", emoji: "🔩", count: 8 }], result: "Menara Pencakar Langit", emojiResult: "🗼", questions: [{ id: 1, question: "🧱 3 tingkat × 4 = ?", answer: 12, points: 10 }, { id: 2, question: "🪣 4 × 2 = ?", answer: 8, points: 15 }, { id: 3, question: "🔩 8 - 🪣 4 = ?", answer: 4, points: 10 }], built: false },
];

const ITEMS = [
  { item: "kayu", emoji: "🪵", name: "Kayu" }, { item: "batu", emoji: "🪨", name: "Batu" },
  { item: "bibit", emoji: "🌱", name: "Bibit" }, { item: "air", emoji: "💧", name: "Air" },
  { item: "pupuk", emoji: "🟤", name: "Pupuk" }, { item: "pasir", emoji: "🏖️", name: "Pasir" },
  { item: "besi", emoji: "🔩", name: "Besi" }, { item: "kain", emoji: "🧵", name: "Kain" },
  { item: "tali", emoji: "🪢", name: "Tali" }, { item: "bata", emoji: "🧱", name: "Bata" },
  { item: "semen", emoji: "🪣", name: "Semen" },
];

export default function MathCraft({ onComplete }: MathCraftProps) {
  const theme = useThemeStyles();
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [builtItems, setBuiltItems] = useState<string[]>([]);
  const [phase, setPhase] = useState<'gather' | 'craft' | 'complete'>('gather');
  const [gatherMsg, setGatherMsg] = useState<{ item: string; emoji: string; count: number } | null>(null);

  const handleGather = useCallback((item: string, emoji: string) => {
    const count = Math.floor(Math.random() * 3) + 1;
    setGatherMsg({ item, emoji, count });
    setInventory(p => ({ ...p, [item]: (p[item] || 0) + count }));
    setTimeout(() => setGatherMsg(null), 1200);
  }, []);

  const startCraft = (recipe: Recipe) => {
    const ok = recipe.ingredients.every(i => (inventory[i.item] || 0) >= i.count);
    if (!ok) return;
    setCurrentRecipe(recipe); setQIdx(0); setPhase('craft');
  };

  const handleAnswer = (ans: number) => {
    if (!currentRecipe || feedback) return;
    const q = currentRecipe.questions[qIdx];
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok); setFeedback(true);
    if (ok) setScore(s => s + q.points);
    setTimeout(() => {
      if (qIdx < currentRecipe.questions.length - 1) {
        setQIdx(i => i + 1); setSelected(null); setFeedback(false);
      } else {
        const newRecipes = recipes.map(r => r.id === currentRecipe.id ? { ...r, built: true } : r);
        setRecipes(newRecipes);
        const newInv = { ...inventory };
        currentRecipe.ingredients.forEach(i => { newInv[i.item] = (newInv[i.item] || 0) - i.count; });
        setInventory(newInv);
        setBuiltItems(p => [...p, currentRecipe.emojiResult]);
        setPhase('gather'); setCurrentRecipe(null); setFeedback(false);
        if (newRecipes.every(r => r.built)) setTimeout(() => setPhase('complete'), 800);
      }
    }, 1000);
  };

  const handleComplete = () => {
    const stars = builtItems.length >= 5 ? 3 : builtItems.length >= 3 ? 2 : 1;
    onComplete(stars, { score, builtItems: builtItems.length });
  };

  const genOpts = (correct: number) => {
    const o = new Set([correct]);
    while (o.size < 4) { const off = Math.floor(Math.random() * 5) + 1; o.add(Math.random() > 0.5 ? correct + off : Math.max(0, correct - off)); }
    return Array.from(o).sort(() => Math.random() - 0.5);
  };

  if (phase === 'complete') {
    const stars = builtItems.length >= 5 ? 3 : builtItems.length >= 3 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🎊</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Semua Dibangun!</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '40px', margin: '16px 0' }}>
          {builtItems.map((item, i) => <span key={i}>{item}</span>)}
        </div>
        <p style={{ color: theme.textSecondary }}>Skor: {score}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (phase === 'craft' && currentRecipe) {
    const q = currentRecipe.questions[qIdx];
    const opts = genOpts(q.answer);
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <button onClick={() => { setPhase('gather'); setCurrentRecipe(null); }} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>← Kembali</button>
          <span style={{ color: theme.textSecondary, fontSize: '13px' }}>{qIdx + 1}/{currentRecipe.questions.length}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '16px' }}>
          <div style={{ width: `${(qIdx / currentRecipe.questions.length) * 100}%`, height: '100%', background: '#7c3aed', borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
        <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: theme.shadow }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>{currentRecipe.emoji}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            {currentRecipe.ingredients.map((ing, i) => <span key={i} style={{ fontSize: '24px' }}>{ing.emoji}×{ing.count}</span>)}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.heading }}>{q.question}</h3>
          <p style={{ fontSize: '12px', color: theme.textMuted }}>+{q.points} poin</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
          {opts.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={feedback} style={{
              padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '12px', border: 'none',
              background: feedback && opt === q.answer ? '#10b981' : feedback && opt === selected ? '#ef4444' : theme.bgHover,
              color: (feedback && (opt === q.answer || opt === selected)) ? '#fff' : theme.text,
              cursor: feedback ? 'default' : 'pointer',
            }}>{opt}</button>
          ))}
        </div>
        {feedback && (
          <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: correct ? '#d1fae5' : '#fee2e2', color: correct ? '#065f46' : '#991b1b', fontWeight: '600', animation: 'pop 0.3s ease-out' }}>
            {correct ? `🎉 +${q.points}` : '❌ Coba lagi!'}
          </div>
        )}
      </div>
    );
  }

  // Gathering
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', background: theme.bg, minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontWeight: '700', color: '#f59e0b' }}>⭐ {score}</span>
        <div style={{ display: 'flex', gap: '4px', fontSize: '20px' }}>
          {builtItems.map((item, i) => <span key={i}>{item}</span>)}
          {Array.from({ length: RECIPES.length - builtItems.length }).map((_, i) => <span key={i} style={{ opacity: 0.3 }}>❓</span>)}
        </div>
      </div>
      <div style={{ background: '#d1fae5', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: '10px' }}>🌍 Kumpulkan Bahan</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {ITEMS.map(item => (
            <button key={item.item} onClick={() => handleGather(item.item, item.emoji)} style={{ background: '#fff', borderRadius: '12px', padding: '8px', textAlign: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '24px' }}>{item.emoji}</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#065f46' }}>×{inventory[item.item] || 0}</div>
            </button>
          ))}
        </div>
      </div>
      {gatherMsg && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', textAlign: 'center', zIndex: 50, animation: 'pop 0.3s ease-out' }}>
          <div style={{ fontSize: '40px' }}>{gatherMsg.emoji}</div>
          <p style={{ fontWeight: '700', color: '#065f46' }}>+{gatherMsg.count} {gatherMsg.emoji}</p>
        </div>
      )}
      <p style={{ fontWeight: '700', color: theme.heading, textAlign: 'center', marginBottom: '8px' }}>🔨 Resep</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {recipes.map(recipe => {
          const canBuild = recipe.ingredients.every(i => (inventory[i.item] || 0) >= i.count);
          return (
            <button key={recipe.id} onClick={() => startCraft(recipe)} disabled={recipe.built} style={{
              padding: '12px', borderRadius: '12px', border: recipe.built ? '2px solid #10b981' : canBuild ? '2px solid #f59e0b' : '1px solid ' + theme.border,
              background: recipe.built ? '#d1fae5' : canBuild ? theme.bgCard : theme.bgHover,
              opacity: recipe.built ? 0.7 : 1, cursor: recipe.built ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
            }}>
              <span style={{ fontSize: '28px' }}>{recipe.built ? '✅' : recipe.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', color: theme.heading, margin: 0 }}>{recipe.name}</p>
                <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>
                  {recipe.ingredients.map(i => `${i.emoji}×${i.count}`).join(' ')}
                </p>
              </div>
              {canBuild && !recipe.built && <span style={{ color: '#f59e0b' }}>🔨</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}