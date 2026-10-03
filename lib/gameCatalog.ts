// lib/gameCatalog.ts
// 🎮 SUMBER DATA TUNGGAL untuk semua game Kid Arcade.
// Header (filter kelas) dan GameSelector (grid game) sama-sama membaca dari sini,
// supaya jumlah game & warna kategori selalu sinkron di satu tempat.

export interface GameItem {
  id: string;
  label: string;
  color: string;
  textColor: string;
  grade: string;
  /** 1 = mudah, 2 = sedang, 3 = menantang — tampil sebagai bintang di kartu game */
  difficulty: 1 | 2 | 3;
  /** Tandai game yang baru ditambahkan */
  isNew?: boolean;
  /** Tandai game andalan/favorit */
  isHot?: boolean;
}

export interface CategoryMeta {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'paud', label: 'PAUD', emoji: '👶', color: '#f59e0b', soft: '#fef3c7' },
  { id: 'tk', label: 'TK', emoji: '🎨', color: '#ec4899', soft: '#fce7f3' },
  { id: '1', label: 'Kelas 1', emoji: '📚', color: '#10b981', soft: '#d1fae5' },
  { id: '2', label: 'Kelas 2', emoji: '✏️', color: '#3b82f6', soft: '#dbeafe' },
  { id: '3', label: 'Kelas 3', emoji: '🌟', color: '#8b5cf6', soft: '#ede9fe' },
  { id: '4', label: 'Kelas 4', emoji: '🚀', color: '#ef4444', soft: '#fee2e2' },
  { id: '5', label: 'Kelas 5', emoji: '💡', color: '#f97316', soft: '#ffedd5' },
  { id: '6', label: 'Kelas 6', emoji: '🏆', color: '#06b6d4', soft: '#cffafe' },
];

export function getCategoryMeta(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function gradeLabel(grade: string): string {
  if (grade === 'all') return 'Semua';
  return getCategoryMeta(grade)?.label || grade;
}

export const games: GameItem[] = [
  // ============================================
  // 👶 PAUD
  // ============================================
  { id: 'superpaud', label: '🌻 Kebun Angka Ajaib', color: '#fef3c7', textColor: '#92400e', grade: 'paud', difficulty: 1, isHot: true, isNew: true },
  { id: 'kenalangka', label: '🌟 Kenal Angka', color: '#fef3c7', textColor: '#92400e', grade: 'paud', difficulty: 1 },
  { id: 'hitunghewan', label: '🐮 Hitung Hewan', color: '#d1fae5', textColor: '#065f46', grade: 'paud', difficulty: 1 },
  { id: 'bentukwarna', label: '🔺 Bentuk Warna', color: '#fce7f3', textColor: '#9d174d', grade: 'paud', difficulty: 1 },
  { id: 'besarkecil', label: '🐘 Besar Kecil', color: '#ede9fe', textColor: '#5b21b6', grade: 'paud', difficulty: 1 },
  { id: 'cocokangka', label: '🎯 Cocok Angka', color: '#e0f2fe', textColor: '#075985', grade: 'paud', difficulty: 1 },

  // ============================================
  // 🎨 TK
  // ============================================
  { id: 'supertk', label: '🏰 Petualangan Angka', color: '#fce7f3', textColor: '#9d174d', grade: 'tk', difficulty: 1, isHot: true, isNew: true },
  { id: 'tambahsederhana', label: '➕ Tambah Asyik', color: '#d1fae5', textColor: '#065f46', grade: 'tk', difficulty: 1 },
  { id: 'kurangseru', label: '➖ Kurang Seru', color: '#fee2e2', textColor: '#991b1b', grade: 'tk', difficulty: 1 },
  { id: 'urutangka', label: '🔢 Urut Angka', color: '#ede9fe', textColor: '#5b21b6', grade: 'tk', difficulty: 1 },
  { id: 'hitungbuah', label: '🍎 Hitung Buah', color: '#fef3c7', textColor: '#92400e', grade: 'tk', difficulty: 1 },
  { id: 'pologambar', label: '🧩 Pola Gambar', color: '#fce7f3', textColor: '#9d174d', grade: 'tk', difficulty: 1 },
  { id: 'countobjects', label: '🔵 Hitung Benda', color: '#dbeafe', textColor: '#1e40af', grade: 'tk', difficulty: 1 },

  // ============================================
  // 📚 KELAS 1
  // ============================================
  // 🔥 Game unggulan (Super / Olimpiade)
  { id: 'super1', label: '⚔️ Arena Hitung Super', color: '#d1fae5', textColor: '#065f46', grade: '1', difficulty: 2, isHot: true, isNew: true },
  { id: 'detektifangka', label: '🔍 Detektif Angka', color: '#fee2e2', textColor: '#991b1b', grade: '1', difficulty: 3, isNew: true, isHot: true },
  { id: 'polalogika', label: '🧩 Pola & Logika', color: '#d1fae5', textColor: '#065f46', grade: '1', difficulty: 2, isNew: true },
  { id: 'timbanganajaib', label: '⚖️ Timbangan Ajaib', color: '#fef3c7', textColor: '#92400e', grade: '1', difficulty: 2, isNew: true },
  { id: 'kotakkombinasi', label: '📦 Kotak Kombinasi', color: '#ede9fe', textColor: '#5b21b6', grade: '1', difficulty: 2, isNew: true },

  // 🆕 Game baru — Number Bonds, Subitizing, Pola Visual
  { id: 'pasanganpintar', label: '🔗 Pasangan Pintar', color: '#dbeafe', textColor: '#1e40af', grade: '1', difficulty: 1, isNew: true, isHot: true },
  { id: 'tebakcepat', label: '👀 Tebak Cepat', color: '#ffedd5', textColor: '#9a3412', grade: '1', difficulty: 1, isNew: true, isHot: true },
  { id: 'detektifpola', label: '🔍 Detektif Pola', color: '#cffafe', textColor: '#155e75', grade: '1', difficulty: 2, isNew: true },

  // 🎯 Mastery & dasar berhitung
  { id: 'catchup1', label: '🚀 Jagoan Berhitung', color: '#d1fae5', textColor: '#065f46', grade: '1', difficulty: 1, isHot: true },
  { id: 'tambahasyik', label: '➕ Tambah Cepat', color: '#dbeafe', textColor: '#1e40af', grade: '1', difficulty: 1 },
  { id: 'kurangseru1', label: '➖ Kurang Cepat', color: '#fee2e2', textColor: '#991b1b', grade: '1', difficulty: 1 },

  // 📐 Materi Kelas 1
  { id: 'jamwaktu', label: '🕐 Jam & Waktu', color: '#cffafe', textColor: '#155e75', grade: '1', difficulty: 2 },
  { id: 'bangundatar', label: '🔺 Bangun Datar', color: '#ede9fe', textColor: '#5b21b6', grade: '1', difficulty: 1 },
  { id: 'uangsaku', label: '💵 Uang Saku', color: '#d1fae5', textColor: '#065f46', grade: '1', difficulty: 2 },
  { id: 'polabilangan', label: '🔢 Pola Bilangan', color: '#ede9fe', textColor: '#5b21b6', grade: '1', difficulty: 2 },
  { id: 'panjangpendek', label: '📏 Panjang Pendek', color: '#ffedd5', textColor: '#9a3412', grade: '1', difficulty: 1 },
  { id: 'mathquiz1', label: '🎯 Kuis Kelas 1', color: '#e0e7ff', textColor: '#3730a3', grade: '1', difficulty: 2 },
  { id: 'puzzle', label: '🧩 Puzzle Math', color: '#ffedd5', textColor: '#9a3412', grade: '1', difficulty: 2 },
  { id: 'wordmatch', label: '📖 Word Match', color: '#ccfbf1', textColor: '#134e4a', grade: '1', difficulty: 2 },

  // ============================================
  // ✏️ KELAS 2
  // ============================================
  { id: 'super2', label: '👑 Kerajaan Perkalian', color: '#dbeafe', textColor: '#1e40af', grade: '2', difficulty: 2, isHot: true, isNew: true },
  { id: 'tambahcepat', label: '➕ Tambah Cepat', color: '#dbeafe', textColor: '#1e40af', grade: '2', difficulty: 1 },
  { id: 'kurangcepat', label: '➖ Kurang Cepat', color: '#fee2e2', textColor: '#991b1b', grade: '2', difficulty: 1 },
  { id: 'kaliawal', label: '✖️ Perkalian Awal', color: '#ede9fe', textColor: '#5b21b6', grade: '2', difficulty: 2 },
  { id: 'bagiawal', label: '➗ Pembagian Awal', color: '#d1fae5', textColor: '#065f46', grade: '2', difficulty: 2 },
  { id: 'mathadventure', label: '🏃 Adventure', color: '#ede9fe', textColor: '#5b21b6', grade: '2', difficulty: 2 },
  { id: 'numberninja', label: '🥷 Ninja Math', color: '#e5e7eb', textColor: '#374151', grade: '2', difficulty: 2 },
  { id: 'magictable', label: '🌟 Tabel Ajaib', color: '#fef3c7', textColor: '#92400e', grade: '2', difficulty: 2 },
  { id: 'fillblanks', label: '✏️ Fill Blanks', color: '#ccfbf1', textColor: '#134e4a', grade: '2', difficulty: 2 },

  // ============================================
  // 🌟 KELAS 3
  // ============================================
  { id: 'sprintkali', label: '⚡ Sprint Kali 60 Detik', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 2, isNew: true, isHot: true },
  { id: 'tembakjawaban', label: '🎯 Tembak Jawaban', color: '#dbeafe', textColor: '#1e40af', grade: '3', difficulty: 2, isNew: true },
  { id: 'kartuberpasangan', label: '🎴 Kartu Berpasangan', color: '#ede9fe', textColor: '#5b21b6', grade: '3', difficulty: 1, isNew: true },
  { id: 'rodakali', label: '🎡 Roda Keberuntungan Kali', color: '#fce7f3', textColor: '#9d174d', grade: '3', difficulty: 2, isNew: true },
  { id: 'kalikilat3', label: '⚡ Perkalian Kilat', color: '#ede9fe', textColor: '#5b21b6', grade: '3', difficulty: 2, isHot: true },
  { id: 'super3', label: '🥊 Arena Master 4 Operasi', color: '#ede9fe', textColor: '#5b21b6', grade: '3', difficulty: 3, isHot: true, isNew: true },
  { id: 'kalimaster', label: '✖️ Kali Master', color: '#ede9fe', textColor: '#5b21b6', grade: '3', difficulty: 2 },
  { id: 'kalimultimode', label: '🎮 Multi Mode Kali', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 2 },
  { id: 'timestablehero', label: '⚡ Times Table Hero', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 3, isHot: true },
  { id: 'bagimaster', label: '➗ Bagi Master', color: '#d1fae5', textColor: '#065f46', grade: '3', difficulty: 2 },
  { id: 'pecahanvisual', label: '🍕 Pecahan Visual', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 2 },
  { id: 'geometrifun', label: '📐 Geometri Fun', color: '#dbeafe', textColor: '#1e40af', grade: '3', difficulty: 2 },
  { id: 'thinkingblocks', label: '🟦 Thinking Blocks', color: '#dbeafe', textColor: '#1e40af', grade: '3', difficulty: 2 },
  { id: 'placevaluequest', label: '🔢 Place Value Quest', color: '#d1fae5', textColor: '#065f46', grade: '3', difficulty: 2 },
  { id: 'measurequest', label: '📏 MeasureQuest', color: '#eff6ff', textColor: '#1e40af', grade: '3', difficulty: 2, isNew: true },
  { id: 'shapeland', label: '🔷 ShapeLand', color: '#ecfdf5', textColor: '#065f46', grade: '3', difficulty: 2, isNew: true },
  { id: 'moneysmart', label: '💰 MoneySmart', color: '#fffbeb', textColor: '#92400e', grade: '3', difficulty: 2, isNew: true },
  { id: 'mathcraft', label: '🏗️ Craft', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 2 },
  { id: 'dicequest', label: '🎲 DiceQuest', color: '#ffedd5', textColor: '#9a3412', grade: '3', difficulty: 2 },
  { id: 'multblitz', label: '⚡ Blitz Perkalian', color: '#fef3c7', textColor: '#92400e', grade: '3', difficulty: 3 },
  { id: 'bubble', label: '🎈 Bubble Math', color: '#d1fae5', textColor: '#065f46', grade: '3', difficulty: 2 },

  // ============================================
  // 🚀 KELAS 4
  // ============================================
  { id: 'super4', label: '🗝️ Dungeon Pecahan & KPK', color: '#fee2e2', textColor: '#991b1b', grade: '4', difficulty: 3, isHot: true, isNew: true },
  { id: 'pecahan4', label: '🍕 Pecahan 4', color: '#fef3c7', textColor: '#92400e', grade: '4', difficulty: 2 },
  { id: 'desimalfun', label: '🔢 Desimal Fun', color: '#cffafe', textColor: '#155e75', grade: '4', difficulty: 2 },
  { id: 'kpkfpb', label: '🔑 KPK & FPB', color: '#ede9fe', textColor: '#5b21b6', grade: '4', difficulty: 3 },
  { id: 'sudut', label: '📐 Sudut', color: '#fee2e2', textColor: '#991b1b', grade: '4', difficulty: 2 },
  { id: 'datachart', label: '📊 Diagram Data', color: '#d1fae5', textColor: '#065f46', grade: '4', difficulty: 2 },
  { id: 'memory', label: '🃏 Memory', color: '#ede9fe', textColor: '#5b21b6', grade: '4', difficulty: 2 },
  { id: 'timer', label: '⏱️ Timer', color: '#fee2e2', textColor: '#991b1b', grade: '4', difficulty: 2 },
  { id: 'mathracer4', label: '🏎️ Racer 4', color: '#fee2e2', textColor: '#991b1b', grade: '4', difficulty: 3 },

  // ============================================
  // 💡 KELAS 5
  // ============================================
  { id: 'super5', label: '🏅 Olimpiade Arena', color: '#ffedd5', textColor: '#9a3412', grade: '5', difficulty: 3, isHot: true, isNew: true },
  { id: 'pecahan5', label: '🍕 Pecahan 5', color: '#fef3c7', textColor: '#92400e', grade: '5', difficulty: 2 },
  { id: 'volumekubus', label: '📦 Volume', color: '#dbeafe', textColor: '#1e40af', grade: '5', difficulty: 3 },
  { id: 'kecepatanwaktu', label: '🚗 Kecepatan', color: '#fee2e2', textColor: '#991b1b', grade: '5', difficulty: 3 },
  { id: 'skalapeta', label: '🗺️ Skala Peta', color: '#d1fae5', textColor: '#065f46', grade: '5', difficulty: 3 },
  { id: 'matholympiad', label: '🏆 Olympiad', color: '#fef3c7', textColor: '#92400e', grade: '5', difficulty: 3, isHot: true },
  { id: 'pizzafraction', label: '🍕 Pecahan', color: '#fef3c7', textColor: '#92400e', grade: '5', difficulty: 2 },
  { id: 'mathdetective', label: '🔍 Detektif', color: '#e0e7ff', textColor: '#3730a3', grade: '5', difficulty: 3 },
  { id: 'mathscrabble', label: '🔤 Scrabble', color: '#ccfbf1', textColor: '#134e4a', grade: '5', difficulty: 2 },

  // ============================================
  // 🏆 KELAS 6
  // ============================================
  { id: 'master6', label: '🎓 Master FPB KPK Pecahan Ruang', color: '#cffafe', textColor: '#155e75', grade: '6', difficulty: 3, isHot: true },
  { id: 'super6', label: '🏆 Kejuaraan Matematika', color: '#cffafe', textColor: '#155e75', grade: '6', difficulty: 3, isHot: true, isNew: true },
  { id: 'lingkaranmaster', label: '⭕ Lingkaran', color: '#cffafe', textColor: '#155e75', grade: '6', difficulty: 3 },
  { id: 'peluangdata', label: '🎲 Peluang', color: '#ede9fe', textColor: '#5b21b6', grade: '6', difficulty: 3 },
  { id: 'bilbulat', label: '➖ Bil Bulat', color: '#e0e7ff', textColor: '#3730a3', grade: '6', difficulty: 2 },
  { id: 'statistikdata', label: '📊 Statistik', color: '#fce7f3', textColor: '#9d174d', grade: '6', difficulty: 3 },
  { id: 'bangunruang6', label: '📦 Bangun Ruang', color: '#ccfbf1', textColor: '#134e4a', grade: '6', difficulty: 3 },
  { id: 'ruangmaster', label: '🏠 Ruang Master', color: '#dbeafe', textColor: '#1e40af', grade: '6', difficulty: 3 },
  { id: 'ratiorumble', label: '⚖️ Ratio Rumble', color: '#ede9fe', textColor: '#5b21b6', grade: '6', difficulty: 3 },
  { id: 'algebrabalance', label: '⚖️ Algebra Balance', color: '#f5f3ff', textColor: '#5b21b6', grade: '6', difficulty: 3 },
  { id: 'decimalmart', label: '🛒 DecimalMart', color: '#d1fae5', textColor: '#065f46', grade: '6', difficulty: 2 },
  { id: 'mixfractionkitchen', label: '🍕 MixFraction Kitchen', color: '#fffbeb', textColor: '#92400e', grade: '6', difficulty: 3 },
  { id: 'mathmaster6', label: '🎓 MathMaster 6', color: '#ede9fe', textColor: '#5b21b6', grade: '6', difficulty: 3, isHot: true },
  { id: 'mathracer6', label: '🏎️ Racer 6', color: '#fee2e2', textColor: '#991b1b', grade: '6', difficulty: 3 },
  { id: 'mathtower', label: '🏰 Tower', color: '#e5e7eb', textColor: '#374151', grade: '6', difficulty: 3 },
  { id: 'geoquest', label: '📐 GeoQuest', color: '#ede9fe', textColor: '#5b21b6', grade: '6', difficulty: 3 },
  { id: 'bangunyuk', label: '🏠 Bangun Yuk', color: '#d1fae5', textColor: '#065f46', grade: '6', difficulty: 2 },

  // ============================================
  // 🌐 SEMUA KELAS
  // ============================================
  { id: 'aigame', label: '🤖 AI Game', color: '#ede9fe', textColor: '#5b21b6', grade: 'all', difficulty: 2, isHot: true },
];

export function getGamesByGrade(grade: string): GameItem[] {
  if (grade === 'all') return games;
  return games.filter((g) => g.grade === grade || g.grade === 'all');
}

export function countByGrade(grade: string): number {
  return games.filter((g) => g.grade === grade).length;
}