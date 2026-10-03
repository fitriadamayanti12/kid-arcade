// hooks/useGameComplete.ts
import { useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const BADGE_RULES: Record<string, (stars: number, score: number, extra?: any) => string | null> = {
  // ============================================
  // 🎮 GAME UMUM
  // ============================================
  memory: (stars) => stars >= 3 ? '🧠 Memory Master' : null,
  timer: (stars) => stars >= 3 ? '⚡ Speed Demon' : null,
  bubble: (_, score) => score >= 50 ? '🧮 Math Wizard' : null,
  wordmatch: (stars) => stars >= 3 ? '📖 Word Master' : null,
  fillblanks: (stars) => stars >= 3 ? '✏️ Fill Master' : null,
  aigame: (stars) => stars >= 3 ? '🤖 AI Master' : null,

  // ============================================
  // 🧩 GAME PENALARAN OLIMPIADE KELAS 1
  // ============================================
  polalogika: (stars, _s, extra) => stars >= 3 && extra?.bossCleared ? '🧩 Master Pola' : null,
  timbanganajaib: (stars, _s, extra) => stars >= 3 && extra?.bossCleared ? '⚖️ Ahli Timbangan' : null,
  kotakkombinasi: (stars, _s, extra) => stars >= 3 && extra?.bossCleared ? '📦 Jago Kombinasi' : null,
  detektifangka: (stars, _s, extra) => stars >= 3 && extra?.bossCleared ? '🔍 Detektif Ulung' : null,

  // ============================================
  // 🔗 GAME NUMBER BONDS, SUBITIZING & POLA KELAS 1
  // ============================================
  pasanganpintar: (stars, _s, extra) =>
    stars >= 3 && (extra?.score ?? 0) >= 10 ? '🔗 Master Pasangan' : null,
  tebakcepat: (stars, _s, extra) =>
    stars >= 3 && (extra?.score ?? 0) >= 10 ? '👀 Mata Elang' : null,
  detektifpola: (stars, _s, extra) =>
    stars >= 3 && (extra?.score ?? 0) >= 10 ? '🔍 Detektif Pola' : null,

  // ============================================
  // 🎮 GAME KELAS 1 LAMA
  // ============================================
  bangundatar: (stars) => stars >= 3 ? '🔺 Ahli Bangun Datar' : null,
  jamwaktu: (stars) => stars >= 3 ? '🕐 Ahli Jam' : null,
  kurangseru1: (stars) => stars >= 3 ? '➖ Jago Kurang' : null,
  mathquiz1: (stars) => stars >= 3 ? '🎯 Kuis Kelas 1 Jago' : null,
  panjangpendek: (stars) => stars >= 3 ? '📏 Jago Ukur' : null,
  polabilangan: (stars) => stars >= 3 ? '🔢 Master Pola Angka' : null,
  tambahasyik: (stars) => stars >= 3 ? '➕ Jago Tambah' : null,
  uangsaku: (stars) => stars >= 3 ? '💵 Jago Uang' : null,

  // ============================================
  // 🚀 GAME KILAT PERKALIAN KELAS 3
  // ============================================
  sprintkali: (stars, _s, extra) =>
    stars >= 3 && (extra?.score ?? 0) >= 25 ? '⚡ Kilat Perkalian' : null,
  kartuberpasangan: (stars) => stars >= 3 ? '🎴 Ingatan Tajam' : null,
  rodakali: (stars) => stars === 3 ? '🎡 Jackpot Kali' : null,

  // ============================================
  // 🎯 GAME PENGUASAAN (MasteryPractice)
  // ============================================
  catchup1: (stars, _s, extra) =>
    stars >= 3 && (extra?.mastery ?? 0) >= 0.25 ? '🚀 Jagoan Berhitung' : null,
  kalikilat3: (stars, _s, extra) =>
    stars >= 3 && (extra?.mastery ?? 0) >= 0.5 ? '⚡ Jagoan Perkalian' : null,
  master6: (stars, _s, extra) =>
    stars >= 3 && (extra?.mastery ?? 0) >= 0.4 ? '🎓 Master Materi 6' : null,

  // ============================================
  // 🔥 GAME SUPER (PowerBattle dengan bos)
  // ============================================
  superpaud: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🌻 Tukang Kebun Ajaib' : null,
  supertk: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🏰 Ksatria Angka' : null,
  super1: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '⚔️ Pendekar Hitung' : null,
  super2: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '👑 Raja Perkalian' : null,
  super3: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🥊 Juara Arena' : null,
  super4: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🗝️ Penakluk Dungeon' : null,
  super5: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🏅 Medali Olimpiade' : null,
  super6: (stars, _s, extra) => extra?.bossCleared && stars >= 3 ? '🏆 Juara Kejuaraan' : null,

  // Fallback PowerBattle generik
  powerbattle: (stars, _s, extra) =>
    stars >= 3 && extra?.bossCleared ? '⚔️ Penakluk Arena' : null,

  // ============================================
  // 📚 GAME TEMATIK
  // ============================================
  countobjects: (stars) => stars >= 3 ? '🔢 Counting Master' : null,
  pizzafraction: (stars) => stars >= 3 ? '🍕 Fraction Expert' : null,
  mathadventure: (_, __, extra) => extra?.score >= 200 ? '🎮 Game Master' : null,
  mathdetective: (_, __, extra) => extra?.solvedCases >= 4 ? '🔍 Super Detective' : null,
  numberninja: (_, __, extra) => extra?.bestStreak >= 20 ? '🥷 Ninja Master' : null,
  mathscrabble: (_, score) => score >= 1000 ? '🔤 Scrabble Champion' : null,
  mathcraft: (_, __, extra) => extra?.builtItems >= 5 ? '🏗️ Master Builder' : null,
  mathracer: (_, __, extra) => extra?.position === 1 ? '🏎️ Racing Champion' : null,
  mathracer4: (_, __, extra) => extra?.position === 1 ? '🏎️ Racing Champion' : null,
  mathracer6: (_, __, extra) => extra?.position === 1 ? '🏎️ Racing Champion' : null,
  dicequest: (_, __, extra) => extra?.treasures >= 3 ? '🎲 Dice Master' : null,
  mathtower: (_, __, extra) => extra?.wave >= 5 ? '🏰 Tower Defender' : null,
  multblitz: (_, __, extra) => extra?.tablesMastered >= 5 ? '⚡ Multiplication Master' : null,
  geoquest: (_, __, extra) => extra?.totalMastered >= 6 ? '📐 Geo Master' : null,
  magictable: (_, __, extra) => extra?.tablesLearned >= 5 ? '🌟 Table Wizard' : null,
  bangunyuk: (_, __, extra) => extra?.learnedShapes >= 4 ? '🏠 Geometry Master' : null,
  kenalangka: (stars) => stars >= 3 ? '🌟 Angka Master' : null,
  hitunghewan: (stars) => stars >= 3 ? '🐮 Animal Counter' : null,
  tambahsederhana: (stars) => stars >= 3 ? '➕ Math Starter' : null,
  kalimaster: (stars) => stars >= 3 ? '✖️ Multiplication Pro' : null,
  bagimaster: (stars) => stars >= 3 ? '➗ Division Pro' : null,
  lingkaranmaster: (stars) => stars >= 3 ? '⭕ Circle Master' : null,
  matholympiad: (stars) => stars >= 3 ? '🏆 Olympiad Star' : null,
};

export function useGameComplete(playerName: string) {
  const { playSound } = useSoundEffect();
  const isCompletingRef = useRef(false);

  const handleGameComplete = useCallback(async (
    selectedGame: string,
    stars: number,
    extra?: any,
    onReward?: (reward: any) => void
  ) => {
    if (isCompletingRef.current || !playerName) return;
    isCompletingRef.current = true;

    // ⚡ Bonus kombo — pakai maxCombo dulu (di-set oleh PowerBattle & game lain),
    // lalu fallback ke streak / combo.
    const comboValue = extra?.maxCombo || extra?.streak || extra?.combo || 0;
    const comboBonus = comboValue >= 10 ? 15 : comboValue >= 5 ? 8 : comboValue >= 3 ? 3 : 0;
    const score = (extra?.score || stars * 10) + comboBonus;

    try {
      playSound('win');

      // ============================================
      // 1. INSERT ke game_scores
      // ============================================
      const { error: insertError } = await supabase
        .from('game_scores')
        .insert([{
          player_name: playerName,
          game_type: selectedGame,
          stars,
          score,
          correct_answers: extra?.correctAnswers || extra?.score || stars,
          total_questions: extra?.total || 10,
          accuracy: extra?.accuracy || Math.round((stars / 3) * 100),
          time_spent: extra?.time || extra?.moves || 0,
          max_combo: comboValue,
          level_reached: extra?.level || 1,
          extras: extra || {},
          completed_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ Score saved!', { player: playerName, game: selectedGame, stars, score });
      }

      // ============================================
      // 2. UPDATE / CREATE players
      // ============================================
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .ilike('username', playerName)
        .single();

      let newBadge: string | null = null;
      let leveledUp = false;
      let newLevel = 1;

      if (existing) {
        const newTotalStars = (existing.total_stars || 0) + stars;
        const newTotalGames = (existing.total_games_played || 0) + 1;

        // 🏆 Level = total bintang / 10
        const prevLevel = Math.floor((existing.total_stars || 0) / 10) + 1;
        newLevel = Math.floor(newTotalStars / 10) + 1;
        leveledUp = newLevel > prevLevel;

        // ============================================
        // 3. TENTUKAN BADGE
        // ============================================
        const badgeRule = BADGE_RULES[selectedGame];
        if (badgeRule) newBadge = badgeRule(stars, score, extra);

        // Milestone global
        if (!newBadge && newTotalGames === 5) newBadge = '🎮 Gamer Pemula';
        if (!newBadge && newTotalStars >= 30) newBadge = '🌟 Bintang Kolektor';
        if (!newBadge && newTotalStars >= 50) newBadge = '💎 Kolektor Bintang';
        if (!newBadge && newTotalGames === 10) newBadge = '🏆 Game Champion';
        if (!newBadge && newTotalGames === 25) newBadge = '🎖️ Veteran Gamer';
        if (!newBadge && newTotalGames === 50) newBadge = '🏅 Legenda Game';
        if (!newBadge && newTotalStars >= 100) newBadge = '👑 LEGEND!';

        // Jangan beri lencana yang sama berulang kali
        if (newBadge && (existing.badges || []).includes(newBadge)) newBadge = null;

        const updatedBadges = newBadge
          ? [...(existing.badges || []), newBadge]
          : (existing.badges || []);

        await supabase
          .from('players')
          .update({
            total_stars: newTotalStars,
            total_games_played: newTotalGames,
            badges: updatedBadges,
            last_played_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (newBadge || leveledUp) playSound('levelUp');
      } else {
        // Pemain baru
        const badgeRule = BADGE_RULES[selectedGame];
        if (badgeRule) newBadge = badgeRule(stars, score, extra);

        await supabase
          .from('players')
          .insert([{
            username: playerName,
            total_stars: stars,
            total_games_played: 1,
            avatar: '👦',
            badges: newBadge ? [newBadge] : [],
            stickers: [],
            last_played_at: new Date().toISOString(),
          }]);

        if (newBadge) playSound('levelUp');
      }

      // ============================================
      // 4. TRIGGER EVENT untuk Leaderboard & Progress
      // ============================================
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game-completed'));
      }

      // ============================================
      // 5. Tampilkan reward
      // ============================================
      onReward?.({
        stars,
        newBadge,
        gameType: selectedGame,
        score,
        comboBonus,
        leveledUp,
        newLevel,
      });

    } catch (error) {
      console.error('❌ Game complete error:', error);
      onReward?.({
        stars,
        newBadge: null,
        gameType: selectedGame,
        score,
        comboBonus,
        leveledUp: false,
        newLevel: 1,
      });
    } finally {
      setTimeout(() => { isCompletingRef.current = false; }, 500);
    }
  }, [playerName, playSound]);

  return { handleGameComplete };
}