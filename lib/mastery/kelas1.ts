// lib/mastery/kelas1.ts
// 🚀 Jagoan Berhitung — jalur "catch up" Kelas 1: menghitung → pasangan 10 → tambah/kurang 10 → 20 → soal cerita
import type { MasteryConfig, MasteryQuestion } from './types';
import { randInt, pick, shuffle, nearbyNumbers } from './util';

const EMOJIS = ['🍎', '⭐', '🐥', '🎈', '🍓', '🚗', '🐟', '🌸'];
const NAMES = ['Budi', 'Sari', 'Andi', 'Dina', 'Rina', 'Joko', 'Tono', 'Lina'];
const THINGS = ['kelereng', 'apel', 'buku', 'pensil', 'permen', 'balon'];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---------- daftar skill per tahap ----------
const S_COUNT10 = range(1, 10).map((n) => `c:${n}`);
const S_COUNT20 = range(11, 20).map((n) => `c:${n}`);
const S_BOND = range(1, 9).map((k) => `b:${k}`);
const S_ADD10: string[] = [];
for (let a = 1; a <= 5; a++) for (let b = a; a + b <= 10; b++) S_ADD10.push(`a:${a}+${b}`);
const S_SUB10: string[] = [];
for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) S_SUB10.push(`s:${a}-${b}`);
const S_ADD20: string[] = [];
for (let a = 2; a <= 9; a++) for (let b = Math.max(a, 11 - a); b <= 9; b++) S_ADD20.push(`a2:${a}+${b}`);
const S_SUB20: string[] = [];
for (let a = 11; a <= 18; a++) for (let b = 2; b <= 9; b++) if (a - b < 10) S_SUB20.push(`s2:${a}-${b}`);
const S_WORD = ['w:add', 'w:sub', 'w:cmp'];

function choicesOf(answer: number, min: number, max: number): string[] {
  return shuffle([answer, ...nearbyNumbers(answer, 3, min, max)]).map(String);
}

function withNewlines(items: string[], perRow: number): string {
  let out = '';
  items.forEach((it, i) => {
    out += it;
    if ((i + 1) % perRow === 0 && i < items.length - 1) out += '\n';
  });
  return out;
}

function makeQuestion(skill: string): MasteryQuestion {
  const [kind, rest] = skill.split(':');

  // ---- menghitung benda 1..20 ----
  if (kind === 'c') {
    const n = Number(rest);
    const emoji = pick(EMOJIS);
    if (n <= 10) {
      return {
        prompt: 'Ada berapa?',
        visual: { kind: 'emoji', text: withNewlines(Array(n).fill(emoji), 5) },
        answer: String(n),
        input: 'choice',
        choices: choicesOf(n, 1, 10),
        explain: [
          'Hitung satu-satu sambil menunjuk setiap gambar, jangan ada yang terlewat.',
          `Hitungannya: ${range(1, n).join(', ')}.`,
          `Jadi ada ${n}.`,
        ],
        fastMs: 8000,
      };
    }
    const r = n - 10;
    return {
      prompt: 'Ada berapa?',
      visual: { kind: 'tenframes', count: n, emoji },
      answer: String(n),
      input: 'choice',
      choices: choicesOf(n, 10, 20),
      explain: [
        'Satu kotak yang penuh berisi 10 gambar — tidak perlu dihitung lagi.',
        `Kotak kedua berisi ${r} gambar.`,
        `10 + ${r} = ${n}.`,
      ],
      fastMs: 9000,
    };
  }

  // ---- pasangan 10 ----
  if (kind === 'b') {
    const k = Number(rest);
    const ans = 10 - k;
    return {
      prompt: `${k} + ? = 10`,
      visual: { kind: 'bond', whole: 10, part: k },
      answer: String(ans),
      input: 'choice',
      choices: choicesOf(ans, 0, 10),
      explain: [
        'Kotak sepuluh punya 10 tempat.',
        `Yang biru sudah ada ${k}. Hitung tempat yang masih kosong: ${ans}.`,
        `${k} + ${ans} = 10.`,
      ],
      fastMs: 7000,
    };
  }

  // ---- tambah sampai 10 ----
  if (kind === 'a') {
    const [a, b] = rest.split('+').map(Number);
    const [x, y] = Math.random() > 0.5 ? [a, b] : [b, a];
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const sum = a + b;
    const chain = range(big + 1, sum).join(' → ');
    return {
      prompt: `${x} + ${y} = ?`,
      visual: { kind: 'emoji', text: `${'🔴'.repeat(x)}  +  ${'🔵'.repeat(y)}` },
      answer: String(sum),
      input: 'number',
      explain: [
        `Mulai dari angka yang lebih besar: ${big}.`,
        `Lalu hitung maju ${small} kali: ${chain}.`,
        `Jadi ${x} + ${y} = ${sum}.`,
      ],
      fastMs: 8000,
    };
  }

  // ---- kurang dari 10 ----
  if (kind === 's') {
    const [a, b] = rest.split('-').map(Number);
    const ans = a - b;
    return {
      prompt: `${a} − ${b} = ?`,
      visual: { kind: 'crossed', total: a, crossed: b, emoji: pick(EMOJIS) },
      answer: String(ans),
      input: 'number',
      explain: [
        `Ada ${a} gambar.`,
        `${b} gambar dicoret (diambil).`,
        `Yang tidak dicoret ada ${ans}. Jadi ${a} − ${b} = ${ans}.`,
      ],
      fastMs: 8000,
    };
  }

  // ---- tambah 11..18 (strategi membuat sepuluh) ----
  if (kind === 'a2') {
    const [a, b] = rest.split('+').map(Number);
    const [x, y] = Math.random() > 0.5 ? [a, b] : [b, a];
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const need = 10 - big;
    const left = small - need;
    const sum = a + b;
    return {
      prompt: `${x} + ${y} = ?`,
      visual: { kind: 'bond', whole: 10, part: big },
      answer: String(sum),
      input: 'number',
      explain: [
        `Trik "buat sepuluh": ${big} butuh ${need} lagi supaya jadi 10.`,
        `Ambil ${need} dari ${small}. Sisanya ${small} − ${need} = ${left}.`,
        `10 + ${left} = ${sum}. Jadi ${x} + ${y} = ${sum}.`,
      ],
      fastMs: 10000,
    };
  }

  // ---- kurang 11..18 (turun dulu ke 10) ----
  if (kind === 's2') {
    const [a, b] = rest.split('-').map(Number);
    const ones = a - 10;
    const remain = b - ones;
    const ans = a - b;
    return {
      prompt: `${a} − ${b} = ?`,
      answer: String(ans),
      input: 'number',
      explain: [
        `Trik "turun ke sepuluh": ${a} − ${ones} = 10.`,
        `Yang harus dikurangi masih ${b} − ${ones} = ${remain}.`,
        `10 − ${remain} = ${ans}. Jadi ${a} − ${b} = ${ans}.`,
      ],
      fastMs: 10000,
    };
  }

  // ---- soal cerita ----
  const name = pick(NAMES);
  const thing = pick(THINGS);
  if (rest === 'add') {
    const a = randInt(3, 12);
    const b = randInt(2, Math.min(9, 20 - a));
    return {
      prompt: `${name} punya ${a} ${thing}. Lalu dapat ${b} ${thing} lagi. Sekarang ${name} punya ... ${thing}?`,
      answer: String(a + b),
      input: 'number',
      explain: [
        'Kata "dapat lagi" artinya jumlahnya bertambah → pakai TAMBAH.',
        `${a} + ${b} = ${a + b}.`,
      ],
      fastMs: 20000,
    };
  }
  if (rest === 'sub') {
    const a = randInt(8, 20);
    const b = randInt(2, Math.min(9, a - 1));
    return {
      prompt: `${name} punya ${a} ${thing}. ${pick(['Sebanyak', 'Ia memberikan', 'Yang hilang'])} ${b} ${thing}. Sisa ${thing} ${name} ada ... ?`,
      answer: String(a - b),
      input: 'number',
      explain: [
        'Kata "sisa / diberikan / hilang" artinya jumlahnya berkurang → pakai KURANG.',
        `${a} − ${b} = ${a - b}.`,
      ],
      fastMs: 20000,
    };
  }
  const other = pick(NAMES.filter((n) => n !== name));
  const big = randInt(10, 20);
  const small = randInt(4, big - 2);
  return {
    prompt: `${name} punya ${big} ${thing}, ${other} punya ${small} ${thing}. Berapa ${thing} ${name} lebih banyak dari ${other}?`,
    answer: String(big - small),
    input: 'number',
    explain: [
      'Kata "lebih banyak" artinya mencari selisih → pakai KURANG (yang banyak dikurangi yang sedikit).',
      `${big} − ${small} = ${big - small}.`,
    ],
    fastMs: 20000,
  };
}

function skillLabel(skill: string): string {
  const [kind, rest] = skill.split(':');
  if (kind === 'c') return `Hitung ${rest} benda`;
  if (kind === 'b') return `${rest} + ? = 10`;
  if (kind === 'a' || kind === 'a2') return rest.replace('+', ' + ');
  if (kind === 's' || kind === 's2') return rest.replace('-', ' − ');
  if (rest === 'add') return 'Cerita: tambah';
  if (rest === 'sub') return 'Cerita: kurang';
  return 'Cerita: selisih';
}

export const kelas1Config: MasteryConfig = {
  gameId: 'catchup1',
  title: 'Jagoan Berhitung',
  emoji: '🚀',
  color: '#10b981',
  tagline: 'Naik tangga berhitung, dari menghitung sampai jago tambah-kurang!',
  sessionLength: 10,
  sequential: true,
  passAccuracy: 0.8,
  makeQuestion,
  skillLabel,
  groups: [
    {
      id: 'hitung10',
      label: 'Hitung 1–10',
      emoji: '🔢',
      skills: S_COUNT10,
      lesson: {
        title: 'Menghitung benda',
        points: [
          'Tunjuk satu gambar untuk satu angka. Jangan ada yang terlewat atau terhitung dua kali.',
          'Angka terakhir yang kamu sebut = banyaknya semua benda.',
        ],
        example: '🍎🍎🍎 → 1, 2, 3 → ada 3 apel.',
      },
    },
    {
      id: 'hitung20',
      label: 'Hitung 11–20',
      emoji: '🔟',
      skills: S_COUNT20,
      lesson: {
        title: 'Satu kotak penuh = 10',
        points: [
          'Kotak yang penuh berisi 10, tidak perlu dihitung lagi.',
          'Hitung sisa di kotak kedua, lalu tambahkan ke 10.',
        ],
        example: '1 kotak penuh + 4 gambar = 10 + 4 = 14.',
      },
    },
    {
      id: 'pasangan10',
      label: 'Pasangan 10',
      emoji: '🤝',
      skills: S_BOND,
      lesson: {
        title: 'Pasangan yang jumlahnya 10',
        points: [
          'Hafal pasangan 10 adalah kunci semua tambah & kurang!',
          '1 & 9, 2 & 8, 3 & 7, 4 & 6, 5 & 5.',
        ],
        example: '7 + ? = 10 → yang kosong 3, jadi 7 + 3 = 10.',
      },
    },
    {
      id: 'tambah10',
      label: 'Tambah sampai 10',
      emoji: '➕',
      skills: S_ADD10,
      lesson: {
        title: 'Hitung maju',
        points: [
          'Mulai dari angka yang LEBIH BESAR, lalu hitung maju sebanyak angka yang kecil.',
          '2 + 6? Mulai dari 6 lalu maju 2: 7, 8.',
        ],
        example: '3 + 5 → mulai 5, maju 3: 6, 7, 8 → 8.',
      },
    },
    {
      id: 'kurang10',
      label: 'Kurang dari 10',
      emoji: '➖',
      skills: S_SUB10,
      lesson: {
        title: 'Coret dan sisakan',
        points: [
          'Kurang berarti diambil atau dicoret.',
          'Yang tidak dicoret adalah jawabannya.',
        ],
        example: '7 − 3 → ada 7, coret 3, sisa 4.',
      },
    },
    {
      id: 'tambah20',
      label: 'Tambah sampai 18',
      emoji: '🧮',
      skills: S_ADD20,
      lesson: {
        title: 'Trik buat sepuluh',
        points: [
          'Angka besar butuh berapa lagi supaya jadi 10? Ambil dari angka satunya.',
          '10 ditambah sisanya = jawaban.',
        ],
        example: '8 + 5 → 8 butuh 2 → 5 dipecah 2 & 3 → 10 + 3 = 13.',
      },
    },
    {
      id: 'kurang20',
      label: 'Kurang sampai 18',
      emoji: '🪜',
      skills: S_SUB20,
      lesson: {
        title: 'Trik turun ke sepuluh',
        points: [
          'Kurangi dulu sampai tepat 10.',
          'Sisa yang harus dikurangi, kurangkan lagi dari 10.',
        ],
        example: '15 − 8 → 15 − 5 = 10 → sisa 3 → 10 − 3 = 7.',
      },
    },
    {
      id: 'cerita',
      label: 'Soal Cerita',
      emoji: '📖',
      skills: S_WORD,
      lesson: {
        title: 'Kata kunci cerita',
        points: [
          'Dapat lagi / bertambah → TAMBAH.',
          'Sisa / diberikan / hilang → KURANG.',
          'Lebih banyak dari → KURANG (cari selisih).',
        ],
        example: '9 kelereng, dapat 4 lagi → 9 + 4 = 13.',
      },
    },
  ],
};
