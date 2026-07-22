// hooks/useGameComplete.ts
import { useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const BADGE_RULES: Record<string, (stars: number, score: number, extra?: any) => string | null> = {
  memory: (stars) => stars >= 3 ? '🧠 Memory Master' : null,
  timer: (stars) => stars >= 3 ? '⚡ Speed Demon' : null,
  bubble: (_, score) => score >= 50 ? '🧮 Math Wizard' : null,
  wordmatch: (stars) => stars >= 3 ? '📖 Word Master' : null,
  fillblanks: (stars) => stars >= 3 ? '✏️ Fill Master' : null,
  aigame: (stars) => stars >= 3 ? '🤖 AI Master' : null,
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

    const score = extra?.score || stars * 10;

    try {
      playSound('win');

      // 1. INSERT ke game_scores
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
          max_combo: extra?.streak || extra?.maxCombo || extra?.combo || 0,
          level_reached: extra?.level || 1,
          extras: extra || {},
          completed_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ Score saved!', { player: playerName, game: selectedGame, stars, score });
      }

      // 2. UPDATE/CREATE players
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .ilike('username', playerName)
        .single();

      let newBadge: string | null = null;

      if (existing) {
        const newTotalStars = (existing.total_stars || 0) + stars;
        const newTotalGames = (existing.total_games_played || 0) + 1;

        const badgeRule = BADGE_RULES[selectedGame];
        if (badgeRule) newBadge = badgeRule(stars, score, extra);
        if (!newBadge && newTotalGames === 5) newBadge = '🎮 Gamer Pemula';
        if (!newBadge && newTotalStars >= 30) newBadge = '🌟 Bintang Kolektor';
        if (!newBadge && newTotalGames === 10) newBadge = '🏆 Game Champion';
        if (!newBadge && newTotalStars >= 100) newBadge = '👑 LEGEND!';

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

        if (newBadge) playSound('levelUp');
      } else {
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

      // 🔥 TRIGGER EVENT untuk Leaderboard & Progress auto-refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game-completed'));
      }

      // Trigger reward display
      onReward?.({
        stars,
        newBadge,
        gameType: selectedGame,
        score,
      });

    } catch (error) {
      console.error('❌ Game complete error:', error);
      onReward?.({
        stars,
        newBadge: null,
        gameType: selectedGame,
        score,
      });
    } finally {
      setTimeout(() => { isCompletingRef.current = false; }, 500);
    }
  }, [playerName, playSound]);

  return { handleGameComplete };
}