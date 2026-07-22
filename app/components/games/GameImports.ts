// app/components/games/GameImports.ts
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ============================================
// GAME REGISTRY - ALL 60+ GAMES
// ============================================
const GAME_REGISTRY: Record<string, any> = {
  // ========== PAUD ==========
  kenalangka: () => import('@/app/components/games/paud/KenalAngka'),
  hitunghewan: () => import('@/app/components/games/paud/HitungHewan'),
  bentukwarna: () => import('@/app/components/games/paud/BentukWarna'),
  besarkecil: () => import('@/app/components/games/paud/BesarKecil'),
  cocokangka: () => import('@/app/components/games/paud/CocokAngka'),

  // ========== TK ==========
  tambahsederhana: () => import('@/app/components/games/tk/TambahSederhana'),
  kurangseru: () => import('@/app/components/games/tk/KurangSederhana'),
  urutangka: () => import('@/app/components/games/tk/UrutAngka'),
  hitungbuah: () => import('@/app/components/games/tk/HitungBuah'),
  pologambar: () => import('@/app/components/games/tk/PolaGambar'),

  // ========== Kelas 1 ==========
  tambahasyik: () => import('@/app/components/games/kelas1/TambahAsyik'),
  kurangseru1: () => import('@/app/components/games/kelas1/KurangSeru'),
  jamwaktu: () => import('@/app/components/games/kelas1/JamWaktu'),
  bangundatar: () => import('@/app/components/games/kelas1/BangunDatar'),
  uangsaku: () => import('@/app/components/games/kelas1/UangSaku'),
  polabilangan: () => import('@/app/components/games/kelas1/PolaBilangan'),
  panjangpendek: () => import('@/app/components/games/kelas1/PanjangPendek'),
  mathquiz1: () => import('@/app/components/games/kelas1/MathQuiz1'),

  // ========== Kelas 2 ==========
  tambahcepat: () => import('@/app/components/games/kelas2/TambahCepat'),
  kurangcepat: () => import('@/app/components/games/kelas2/KurangCepat'),
  kaliawal: () => import('@/app/components/games/kelas2/KaliAwal'),
  bagiawal: () => import('@/app/components/games/kelas2/BagiAwal'),

  // ========== Kelas 3 ==========
  kalimaster: () => import('@/app/components/games/kelas3/KaliMaster'),
  bagimaster: () => import('@/app/components/games/kelas3/BagiMaster'),
  pecahanvisual: () => import('@/app/components/games/kelas3/PecahanVisual'),
  geometrifun: () => import('@/app/components/games/kelas3/GeometriFun'),

  // ========== Kelas 4 ==========
  pecahan4: () => import('@/app/components/games/kelas4/Pecahan4'),
  desimalfun: () => import('@/app/components/games/kelas4/DesimalFun'),
  kpkfpb: () => import('@/app/components/games/kelas4/KPKFPB'),
  sudut: () => import('@/app/components/games/kelas4/Sudut'),
  datachart: () => import('@/app/components/games/kelas4/DataChart'),

  // ========== Kelas 5 ==========
  pecahan5: () => import('@/app/components/games/kelas5/Pecahan5'),
  volumekubus: () => import('@/app/components/games/kelas5/VolumeKubus'),
  kecepatanwaktu: () => import('@/app/components/games/kelas5/KecepatanWaktu'),
  skalapeta: () => import('@/app/components/games/kelas5/SkalaPeta'),
  matholympiad: () => import('@/app/components/games/kelas5/MathOlympiad'),

  // ========== Kelas 6 ==========
  lingkaranmaster: () => import('@/app/components/games/kelas6/LingkaranMaster'),
  peluangdata: () => import('@/app/components/games/kelas6/PeluangData'),
  bilbulat: () => import('@/app/components/games/kelas6/BilBulat'),
  statistikdata: () => import('@/app/components/games/kelas6/StatistikData'),
  bangunruang6: () => import('@/app/components/games/kelas6/BangunRuang6'),

  // ========== MathRacer variants (redirect ke MathRacer) ==========
  mathracer4: () => import('@/app/components/games/MathRacer'),
  mathracer6: () => import('@/app/components/games/MathRacer'),

  // ========== Existing Core Games ==========
  pizzafraction: () => import('@/app/components/games/PizzaFraction'),
  dicequest: () => import('@/app/components/games/DiceQuest'),
  mathtower: () => import('@/app/components/games/MathTower'),
  multblitz: () => import('@/app/components/games/MultiplicationBlitz'),
  geoquest: () => import('@/app/components/games/GeoQuest'),
  magictable: () => import('@/app/components/games/MagicTable'),
  bangunyuk: () => import('@/app/components/games/BangunYuk'),
  puzzle: () => import('@/app/components/games/PuzzleGame'),
  memory: () => import('@/app/components/MemoryMatch'),
  timer: () => import('@/app/components/TimerChallenge'),
  bubble: () => import('@/app/components/BubbleMath'),
  wordmatch: () => import('@/app/components/WordMatch'),
  fillblanks: () => import('@/app/components/FillBlanks'),
  aigame: () => import('@/app/components/AIGameGenerator'),
  countobjects: () => import('@/app/components/games/CountObjects'),
  mathadventure: () => import('@/app/components/games/MathAdventure'),
  mathdetective: () => import('@/app/components/games/MathDetective'),
  numberninja: () => import('@/app/components/games/NumberNinja'),
  mathscrabble: () => import('@/app/components/games/MathScrabble'),
  mathcraft: () => import('@/app/components/games/MathCraft'),
  mathracer: () => import('@/app/components/games/MathRacer'),
};

// Generate dynamic components
export const GameComponents: Record<string, ComponentType<any>> = {};

Object.entries(GAME_REGISTRY).forEach(([id, importFn]) => {
  GameComponents[id] = dynamic(importFn, { 
    ssr: false,
    loading: () => null,
  });
});

// List semua game ID
export const GAME_IDS = Object.keys(GAME_REGISTRY);

// Total game
export const TOTAL_GAMES = GAME_IDS.length;

export type GameType = string;