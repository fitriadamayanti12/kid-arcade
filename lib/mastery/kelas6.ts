// lib/mastery/kelas6.ts
// 🎓 Master Materi 6 — FPB, KPK, Pecahan, dan Bangun Ruang (latihan adaptif + pembahasan langkah demi langkah)
import type { MasteryConfig, MasteryQuestion } from './types';
import { randInt, pick, shuffle, gcd, lcm, divisors, primeFactors, factorString, nearbyNumbers } from './util';

// ================= pecahan =================
interface Frac {
  n: number;
  d: number;
}

function red(n: number, d: number): Frac {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/** 5/2 → "2 1/2", 3/4 → "3/4", 6/3 → "2" */
function fmt(f: Frac): string {
  if (f.d === 1) return String(f.n);
  if (f.n > f.d) {
    const w = Math.floor(f.n / f.d);
    const r = f.n % f.d;
    return r === 0 ? String(w) : `${w} ${r}/${f.d}`;
  }
  return `${f.n}/${f.d}`;
}

/** 4 pilihan: jawaban + 3 pengecoh yang nilainya berbeda dari jawaban & satu sama lain */
function fracChoices(ans: Frac, cands: Frac[]): string[] {
  const a = red(ans.n, ans.d);
  const seen = new Set<string>([`${a.n}/${a.d}`]);
  const out: string[] = [];
  const consider = (c: Frac) => {
    if (!(c.n > 0) || !(c.d > 0) || !Number.isFinite(c.n) || !Number.isFinite(c.d)) return;
    const r = red(c.n, c.d);
    const k = `${r.n}/${r.d}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(fmt(r));
    }
  };
  shuffle(cands).forEach(consider);
  let tries = 0;
  while (out.length < 3 && tries < 80) {
    tries++;
    consider({ n: a.n + randInt(-2, 2), d: Math.max(1, a.d + randInt(-1, 1)) });
  }
  return shuffle([fmt(a), ...out.slice(0, 3)]);
}

const DEN = [2, 3, 4, 5, 6, 8, 10, 12];

function genAddSub(sub: boolean) {
  for (;;) {
    const d1 = pick(DEN);
    const d2 = pick(DEN);
    if (d1 === d2 || lcm(d1, d2) > 24) continue;
    let n1 = randInt(1, d1 - 1);
    let n2 = randInt(1, d2 - 1);
    const L = lcm(d1, d2);
    let a = (n1 * L) / d1;
    let b = (n2 * L) / d2;
    if (sub) {
      if (a === b) continue;
      if (a < b) {
        return { n1: n2, d1: d2, n2: n1, d2: d1, L, a: b, b: a };
      }
    }
    return { n1, d1, n2, d2, L, a, b };
  }
}

function addSubQuestion(sub: boolean, story?: (f1: string, f2: string) => string): MasteryQuestion {
  const g = genAddSub(sub);
  const { n1, d1, n2, d2, L, a, b } = g;
  const top = sub ? a - b : a + b;
  const ans = red(top, L);
  const f1 = `${n1}/${d1}`;
  const f2 = `${n2}/${d2}`;
  const explain = [
    ...(story ? [sub ? 'Kata "sisa / dipakai" → KURANG.' : 'Kata "total / jumlah" → TAMBAH.'] : []),
    `Samakan penyebut: KPK ${d1} dan ${d2} = ${L}.`,
    `${f1} = ${a}/${L} dan ${f2} = ${b}/${L}.`,
    `${a}/${L} ${sub ? '−' : '+'} ${b}/${L} = ${top}/${L}.`,
  ];
  const shown = `${top}/${L}`;
  if (fmt(ans) !== shown) explain.push(`Sederhanakan: ${shown} = ${fmt(ans)}.`);
  const cands: Frac[] = sub
    ? [
        { n: n1 - n2, d: Math.abs(d1 - d2) || d1 },
        { n: n1 - n2 > 0 ? n1 - n2 : n2 - n1, d: d1 * d2 },
        { n: top + 1, d: L },
        { n: top - 1, d: L },
      ]
    : [
        { n: n1 + n2, d: d1 + d2 },
        { n: n1 + n2, d: L },
        { n: top + 1, d: L },
        { n: top - 1, d: L },
      ];
  return {
    prompt: story ? story(f1, f2) : `${f1} ${sub ? '−' : '+'} ${f2} = ?`,
    answer: fmt(ans),
    input: 'choice',
    choices: fracChoices(ans, cands),
    explain,
  };
}

interface Mixed {
  w: number;
  n: number;
  d: number;
}

function mixedQuestion(): MasteryQuestion {
  for (;;) {
    const dA = pick([2, 3, 4, 5, 6, 8]);
    const dB = pick([2, 3, 4, 5, 6, 8]);
    if (lcm(dA, dB) > 24) continue;
    let x: Mixed = { w: randInt(1, 4), n: randInt(1, dA - 1), d: dA };
    let y: Mixed = { w: randInt(1, 3), n: randInt(1, dB - 1), d: dB };
    const sub = Math.random() > 0.5;
    const L = lcm(dA, dB);
    const val = (m: Mixed) => ((m.w * m.d + m.n) * L) / m.d;
    if (sub) {
      if (val(x) === val(y)) continue;
      if (val(x) < val(y)) [x, y] = [y, x];
    }
    return buildMixed(x, y, L, sub);
  }
}

function buildMixed(x: Mixed, y: Mixed, L: number, sub: boolean): MasteryQuestion {
  const i1 = x.w * x.d + x.n;
  const i2 = y.w * y.d + y.n;
  const A = (i1 * L) / x.d;
  const B = (i2 * L) / y.d;
  const top = sub ? A - B : A + B;
  const ans = red(top, L);
  const explain = [
    `Ubah ke pecahan biasa: ${x.w} ${x.n}/${x.d} = ${i1}/${x.d} dan ${y.w} ${y.n}/${y.d} = ${i2}/${y.d}.`,
    ...(x.d !== y.d ? [`Samakan penyebut (KPK = ${L}): ${A}/${L} dan ${B}/${L}.`] : []),
    `${A}/${L} ${sub ? '−' : '+'} ${B}/${L} = ${top}/${L}.`,
    `Sederhanakan / ubah ke campuran: ${fmt(ans)}.`,
  ];
  const cands: Frac[] = [
    { n: top + 1, d: L },
    { n: top - 1, d: L },
    { n: top + L, d: L },
    { n: top - L, d: L },
  ];
  return {
    prompt: `${x.w} ${x.n}/${x.d} ${sub ? '−' : '+'} ${y.w} ${y.n}/${y.d} = ?`,
    answer: fmt(ans),
    input: 'choice',
    choices: fracChoices(ans, cands),
    explain,
  };
}

function mulQuestion(): MasteryQuestion {
  if (Math.random() < 0.7) {
    const d1 = randInt(2, 9);
    const d2 = randInt(2, 9);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const P = n1 * n2;
    const Q = d1 * d2;
    const ans = red(P, Q);
    const explain = [`Kalikan pembilang: ${n1} × ${n2} = ${P}.`, `Kalikan penyebut: ${d1} × ${d2} = ${Q}.`];
    if (fmt(ans) !== `${P}/${Q}`) explain.push(`Sederhanakan: ${P}/${Q} = ${fmt(ans)}.`);
    return {
      prompt: `${n1}/${d1} × ${n2}/${d2} = ?`,
      answer: fmt(ans),
      input: 'choice',
      choices: fracChoices(ans, [
        { n: n1 + n2, d: Q },
        { n: P, d: d1 + d2 },
        { n: n1 * d2, d: d1 * n2 },
        { n: P + 1, d: Q },
      ]),
      explain,
    };
  }
  const w = randInt(2, 6);
  const d = randInt(2, 8);
  const n = randInt(1, d - 1);
  const ans = red(w * n, d);
  const explain = [
    `Bilangan bulat dikali pecahan: ${w} × ${n}/${d} = (${w} × ${n})/${d} = ${w * n}/${d}.`,
  ];
  if (fmt(ans) !== `${w * n}/${d}`) explain.push(`Sederhanakan / ubah ke campuran: ${fmt(ans)}.`);
  return {
    prompt: `${w} × ${n}/${d} = ?`,
    answer: fmt(ans),
    input: 'choice',
    choices: fracChoices(ans, [
      { n: w + n, d },
      { n, d: d * w },
      { n: w * n, d: d + w },
      { n: w * n + 1, d },
    ]),
    explain,
  };
}

function divQuestion(): MasteryQuestion {
  for (;;) {
    const d1 = randInt(2, 8);
    const d2 = randInt(2, 8);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const P = n1 * d2;
    const Q = d1 * n2;
    const ans = red(P, Q);
    if (ans.d === 1 && ans.n === 1) continue; // hasil 1 kurang menarik
    const explain = [
      `Bagi pecahan = kali kebalikan (Keep–Change–Flip): ${n1}/${d1} ÷ ${n2}/${d2} = ${n1}/${d1} × ${d2}/${n2}.`,
      `Kalikan: (${n1} × ${d2}) / (${d1} × ${n2}) = ${P}/${Q}.`,
    ];
    if (fmt(ans) !== `${P}/${Q}`) explain.push(`Sederhanakan / ubah ke campuran: ${fmt(ans)}.`);
    return {
      prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ?`,
      answer: fmt(ans),
      input: 'choice',
      choices: fracChoices(ans, [
        { n: n1 * n2, d: d1 * d2 }, // lupa membalik
        { n: d1 * n2, d: n1 * d2 }, // membalik pecahan pertama
        { n: n1 * d2, d: d1 * d2 },
        { n: P + 1, d: Q },
      ]),
      explain,
    };
  }
}

// ================= FPB & KPK =================
const NAMES = ['Ani', 'Budi', 'Citra', 'Dodi', 'Eka', 'Fajar'];

function coprimePair(): { g: number; m1: number; m2: number } {
  for (;;) {
    const g = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    const m1 = randInt(2, 7);
    const m2 = randInt(2, 7);
    if (m1 !== m2 && gcd(m1, m2) === 1) return { g, m1, m2 };
  }
}

function fpbList(): MasteryQuestion {
  const { g, m1, m2 } = coprimePair();
  const a = g * m1;
  const b = g * m2;
  const da = divisors(a);
  const db = divisors(b);
  const common = da.filter((x) => b % x === 0);
  return {
    prompt: `FPB dari ${a} dan ${b} = ?`,
    answer: String(g),
    input: 'number',
    explain: [
      `Faktor ${a}: ${da.join(', ')}.`,
      `Faktor ${b}: ${db.join(', ')}.`,
      `Faktor yang sama: ${common.join(', ')} → yang terbesar adalah ${g}.`,
    ],
  };
}

const POOL_FPB = [24, 30, 36, 42, 48, 54, 60, 72, 84, 90, 96, 108, 120, 144, 180];

function pickTwo(pool: number[], ok: (a: number, b: number) => boolean): [number, number] {
  for (;;) {
    const a = pick(pool);
    const b = pick(pool);
    if (a !== b && ok(a, b)) return [a, b];
  }
}

function fpbTree(): MasteryQuestion {
  const [a, b] = pickTwo(POOL_FPB, (x, y) => gcd(x, y) > 1);
  const fa = primeFactors(a);
  const fb = primeFactors(b);
  const common: Record<number, number> = {};
  Object.keys(fa).forEach((k) => {
    const p = Number(k);
    if (fb[p]) common[p] = Math.min(fa[p], fb[p]);
  });
  const ans = gcd(a, b);
  return {
    prompt: `Tentukan FPB dari ${a} dan ${b} dengan faktorisasi prima.`,
    answer: String(ans),
    input: 'number',
    explain: [
      `${a} = ${factorString(fa)}`,
      `${b} = ${factorString(fb)}`,
      `Ambil faktor prima yang SAMA dengan pangkat TERKECIL: ${factorString(common)} = ${ans}.`,
    ],
  };
}

function fpbStory(): MasteryQuestion {
  const { g, m1, m2 } = coprimePair();
  const a = g * m1;
  const b = g * m2;
  const da = divisors(a);
  const common = da.filter((x) => b % x === 0);
  const name = pick(NAMES);
  const tail = [
    'Kata kunci "paling banyak / paling panjang" + "dibagi sama rata tanpa sisa" → FPB.',
    `Faktor persekutuan ${a} dan ${b}: ${common.join(', ')}.`,
    `Yang terbesar (FPB) = ${g}.`,
  ];
  if (Math.random() > 0.5) {
    return {
      prompt: `${name} punya ${a} kelereng merah dan ${b} kelereng biru. Semuanya dibagi ke beberapa kantong. Setiap kantong berisi kelereng merah sama banyak dan kelereng biru sama banyak, tanpa sisa. Paling banyak ada ... kantong?`,
      answer: String(g),
      input: 'number',
      unit: 'kantong',
      explain: [...tail, `Jadi paling banyak ${g} kantong.`],
    };
  }
  return {
    prompt: `Tali ${name} panjangnya ${a} m dan tali temannya ${b} m. Keduanya dipotong menjadi potongan sama panjang tanpa sisa. Panjang potongan paling panjang = ... m?`,
    answer: String(g),
    input: 'number',
    unit: 'm',
    explain: [...tail, `Jadi potongan terpanjang ${g} m.`],
  };
}

function kpkList(): MasteryQuestion {
  for (;;) {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    if (a === b) continue;
    const L = lcm(a, b);
    if (L > 72) continue;
    const ma = Array.from({ length: L / a }, (_, i) => a * (i + 1));
    const mb = Array.from({ length: L / b }, (_, i) => b * (i + 1));
    return {
      prompt: `KPK dari ${a} dan ${b} = ?`,
      answer: String(L),
      input: 'number',
      explain: [
        `Kelipatan ${a}: ${ma.join(', ')}.`,
        `Kelipatan ${b}: ${mb.join(', ')}.`,
        `Angka yang sama pertama kali (terkecil) = ${L}.`,
      ],
    };
  }
}

const POOL_KPK = [12, 18, 20, 24, 30, 36, 45, 48, 60];

function kpkTree(): MasteryQuestion {
  const [a, b] = pickTwo(POOL_KPK, () => true);
  const fa = primeFactors(a);
  const fb = primeFactors(b);
  const mx: Record<number, number> = {};
  [fa, fb].forEach((f) =>
    Object.keys(f).forEach((k) => {
      const p = Number(k);
      mx[p] = Math.max(mx[p] || 0, f[p]);
    })
  );
  const L = lcm(a, b);
  return {
    prompt: `Tentukan KPK dari ${a} dan ${b} dengan faktorisasi prima.`,
    answer: String(L),
    input: 'number',
    explain: [
      `${a} = ${factorString(fa)}`,
      `${b} = ${factorString(fb)}`,
      `Ambil SEMUA faktor prima dengan pangkat TERBESAR: ${factorString(mx)} = ${L}.`,
    ],
  };
}

function kpkStory(): MasteryQuestion {
  const [a, b] = pickTwo([4, 5, 6, 8, 9, 10, 12, 15, 20], () => true);
  const L = lcm(a, b);
  const g = gcd(a, b);
  const explain = [
    'Kata kunci "bersama lagi / berulang bersamaan" → KPK.',
    `FPB ${a} dan ${b} = ${g}.`,
    `KPK = ${a} × ${b} ÷ ${g} = ${L}.`,
  ];
  if (Math.random() > 0.5) {
    return {
      prompt: `Lampu merah menyala setiap ${a} detik dan lampu biru setiap ${b} detik. Keduanya menyala bersama pertama kali. Setelah berapa detik keduanya menyala bersama lagi?`,
      answer: String(L),
      input: 'number',
      unit: 'detik',
      explain,
    };
  }
  return {
    prompt: `Bus A berangkat setiap ${a} menit dan bus B setiap ${b} menit. Keduanya berangkat bersama pukul 06.00. Setelah berapa menit keduanya berangkat bersama lagi?`,
    answer: String(L),
    input: 'number',
    unit: 'menit',
    explain,
  };
}

// ================= bangun ruang =================
const SIFAT: { q: string; a: number; why: string }[] = [
  { q: 'Berapa banyak rusuk pada kubus?', a: 12, why: '4 rusuk alas + 4 rusuk atas + 4 rusuk tegak = 12.' },
  { q: 'Berapa banyak titik sudut pada balok?', a: 8, why: '4 titik sudut alas + 4 titik sudut atas = 8.' },
  { q: 'Berapa banyak sisi pada kubus?', a: 6, why: 'Alas, atas, dan 4 sisi tegak = 6 sisi.' },
  { q: 'Berapa banyak rusuk pada balok?', a: 12, why: '4 rusuk alas + 4 rusuk atas + 4 rusuk tegak = 12.' },
  { q: 'Berapa banyak sisi pada prisma segitiga?', a: 5, why: '2 segitiga (alas & atas) + 3 sisi tegak = 5.' },
  { q: 'Berapa banyak rusuk pada prisma segitiga?', a: 9, why: '3 rusuk alas + 3 rusuk atas + 3 rusuk tegak = 9.' },
  { q: 'Berapa banyak titik sudut pada prisma segitiga?', a: 6, why: '3 di alas + 3 di atas = 6.' },
  { q: 'Berapa banyak titik sudut pada limas segiempat?', a: 5, why: '4 di alas + 1 puncak = 5.' },
  { q: 'Berapa banyak rusuk pada limas segiempat?', a: 8, why: '4 rusuk alas + 4 rusuk tegak = 8.' },
  { q: 'Berapa banyak sisi pada limas segiempat?', a: 5, why: '1 alas + 4 sisi segitiga = 5.' },
  { q: 'Berapa banyak sisi pada tabung?', a: 3, why: 'Alas, tutup, dan selimut = 3.' },
  { q: 'Berapa banyak sisi pada kerucut?', a: 2, why: 'Alas dan selimut = 2.' },
];

function sifatQuestion(): MasteryQuestion {
  const item = pick(SIFAT);
  return {
    prompt: item.q,
    answer: String(item.a),
    input: 'choice',
    choices: shuffle([item.a, ...nearbyNumbers(item.a, 3, 1, 14)]).map(String),
    explain: [item.why],
  };
}

function ruangQuestion(skill: string): MasteryQuestion {
  switch (skill) {
    case 'v:kubus': {
      const s = randInt(2, 12);
      return {
        prompt: `Sebuah kubus panjang rusuknya ${s} cm. Volumenya = ?`,
        answer: String(s ** 3),
        input: 'number',
        unit: 'cm³',
        explain: ['Volume kubus V = s × s × s.', `V = ${s} × ${s} × ${s} = ${s * s} × ${s} = ${s ** 3} cm³.`],
      };
    }
    case 'v:balok': {
      const p = randInt(3, 15);
      const l = randInt(2, 10);
      const t = randInt(2, 10);
      return {
        prompt: `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Volumenya = ?`,
        answer: String(p * l * t),
        input: 'number',
        unit: 'cm³',
        explain: ['Volume balok V = p × l × t.', `V = ${p} × ${l} × ${t} = ${p * l} × ${t} = ${p * l * t} cm³.`],
      };
    }
    case 'lp:kubus': {
      const s = randInt(2, 12);
      return {
        prompt: `Sebuah kubus panjang rusuknya ${s} cm. Luas permukaannya = ?`,
        answer: String(6 * s * s),
        input: 'number',
        unit: 'cm²',
        explain: [
          'Kubus punya 6 sisi berbentuk persegi yang sama besar.',
          `Luas satu sisi = ${s} × ${s} = ${s * s}.`,
          `Luas permukaan = 6 × ${s * s} = ${6 * s * s} cm².`,
        ],
      };
    }
    case 'lp:balok': {
      const p = randInt(3, 12);
      const l = randInt(2, 8);
      const t = randInt(2, 8);
      const ans = 2 * (p * l + p * t + l * t);
      return {
        prompt: `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Luas permukaannya = ?`,
        answer: String(ans),
        input: 'number',
        unit: 'cm²',
        explain: [
          'LP balok = 2 × (p×l + p×t + l×t).',
          `p×l = ${p * l}, p×t = ${p * t}, l×t = ${l * t}. Jumlahnya ${p * l + p * t + l * t}.`,
          `LP = 2 × ${p * l + p * t + l * t} = ${ans} cm².`,
        ],
      };
    }
    case 'v:liter': {
      const p = randInt(3, 12);
      const l = randInt(2, 8);
      const t = randInt(2, 8);
      return {
        prompt: `Bak air berbentuk balok: panjang ${p} dm, lebar ${l} dm, tinggi ${t} dm. Berapa liter air jika bak terisi penuh?`,
        answer: String(p * l * t),
        input: 'number',
        unit: 'liter',
        explain: [
          `Volume = ${p} × ${l} × ${t} = ${p * l * t} dm³.`,
          'Ingat: 1 dm³ = 1 liter.',
          `Jadi isinya ${p * l * t} liter.`,
        ],
      };
    }
    case 'v:gabungan': {
      const p = randInt(4, 10);
      const l = randInt(3, 8);
      const t = randInt(2, 6);
      const s = randInt(2, 4);
      const vb = p * l * t;
      const vk = s ** 3;
      return {
        prompt: `Bangun gabungan terdiri dari balok (${p} × ${l} × ${t} cm) dan kubus rusuk ${s} cm yang diletakkan di atasnya. Volume seluruhnya = ?`,
        answer: String(vb + vk),
        input: 'number',
        unit: 'cm³',
        explain: [
          `Volume balok = ${p} × ${l} × ${t} = ${vb}.`,
          `Volume kubus = ${s} × ${s} × ${s} = ${vk}.`,
          `Bangun gabungan → jumlahkan: ${vb} + ${vk} = ${vb + vk} cm³.`,
        ],
      };
    }
    case 'v:prisma': {
      const a = pick([4, 6, 8, 10, 12]);
      const ts = randInt(3, 10);
      const tp = randInt(4, 12);
      const alas = (a * ts) / 2;
      return {
        prompt: `Prisma segitiga: alas segitiga ${a} cm, tinggi segitiga ${ts} cm, tinggi prisma ${tp} cm. Volumenya = ?`,
        answer: String(alas * tp),
        input: 'number',
        unit: 'cm³',
        explain: [
          `Luas alas (segitiga) = 1/2 × ${a} × ${ts} = ${alas}.`,
          `V prisma = luas alas × tinggi prisma = ${alas} × ${tp} = ${alas * tp} cm³.`,
        ],
      };
    }
    case 'v:limas': {
      const s = randInt(3, 10);
      const t = 3 * randInt(1, 5);
      const la = s * s;
      return {
        prompt: `Limas beralas persegi dengan sisi ${s} cm dan tinggi ${t} cm. Volumenya = ?`,
        answer: String((la * t) / 3),
        input: 'number',
        unit: 'cm³',
        explain: [
          `Luas alas = ${s} × ${s} = ${la}.`,
          `V limas = 1/3 × luas alas × tinggi = 1/3 × ${la} × ${t}.`,
          `1/3 × ${t} = ${t / 3}, lalu ${la} × ${t / 3} = ${(la * t) / 3} cm³.`,
        ],
      };
    }
    case 'v:tabung': {
      if (Math.random() > 0.5) {
        const r = pick([7, 14, 21]);
        const t = randInt(3, 15);
        const k = (22 * r) / 7;
        return {
          prompt: `Tabung berjari-jari ${r} cm dan tinggi ${t} cm. Volumenya = ? (π = 22/7)`,
          answer: String(k * r * t),
          input: 'number',
          unit: 'cm³',
          explain: [
            'V tabung = π × r × r × t.',
            `22/7 × ${r} = ${k} (coret 7 dengan ${r}).`,
            `${k} × ${r} × ${t} = ${k * r * t} cm³.`,
          ],
        };
      }
      const r = pick([10, 20]);
      const t = randInt(2, 12);
      const ans = (314 * r * r * t) / 100;
      return {
        prompt: `Tabung berjari-jari ${r} cm dan tinggi ${t} cm. Volumenya = ? (π = 3,14)`,
        answer: String(ans),
        input: 'number',
        unit: 'cm³',
        explain: [
          'V tabung = π × r × r × t.',
          `r × r = ${r} × ${r} = ${r * r}.`,
          `3,14 × ${r * r} × ${t} = ${ans} cm³.`,
        ],
      };
    }
    case 'lp:tabung': {
      const r = pick([7, 14]);
      const t = randInt(3, 12);
      const k = (44 * r) / 7;
      const ans = k * (r + t);
      return {
        prompt: `Tabung (dengan tutup) berjari-jari ${r} cm dan tinggi ${t} cm. Luas permukaannya = ? (π = 22/7)`,
        answer: String(ans),
        input: 'number',
        unit: 'cm²',
        explain: [
          'LP tabung = 2 × π × r × (r + t).',
          `r + t = ${r} + ${t} = ${r + t}.`,
          `2 × 22/7 × ${r} = ${k}.`,
          `${k} × ${r + t} = ${ans} cm².`,
        ],
      };
    }
    default: {
      // v:kerucut
      const r = pick([7, 14]);
      const t = 3 * randInt(1, 5);
      const k = (22 * r) / 7;
      const ans = k * r * (t / 3);
      return {
        prompt: `Kerucut berjari-jari ${r} cm dan tinggi ${t} cm. Volumenya = ? (π = 22/7)`,
        answer: String(ans),
        input: 'number',
        unit: 'cm³',
        explain: [
          'V kerucut = 1/3 × π × r × r × t.',
          `1/3 × ${t} = ${t / 3}.`,
          `22/7 × ${r} = ${k}.`,
          `${k} × ${r} × ${t / 3} = ${ans} cm³.`,
        ],
      };
    }
  }
}

function makeQuestion(skill: string): MasteryQuestion {
  switch (skill) {
    case 'fpb:list': return fpbList();
    case 'fpb:tree': return fpbTree();
    case 'fpb:story': return fpbStory();
    case 'kpk:list': return kpkList();
    case 'kpk:tree': return kpkTree();
    case 'kpk:story': return kpkStory();
    case 'pec:add': return addSubQuestion(false);
    case 'pec:sub': return addSubQuestion(true);
    case 'pec:mixed': return mixedQuestion();
    case 'pec:mul': return mulQuestion();
    case 'pec:div': return divQuestion();
    case 'pec:story': {
      const sub = Math.random() > 0.5;
      const item = pick(['tepung', 'gula', 'beras']);
      return addSubQuestion(sub, (f1, f2) =>
        sub
          ? `Ibu punya ${f1} kg ${item}. Sebanyak ${f2} kg dipakai untuk memasak. Sisa ${item} = ... kg?`
          : `Ibu membeli ${f1} kg ${item} kemarin dan ${f2} kg ${item} hari ini. Total ${item} = ... kg?`
      );
    }
    case 'ruang:sifat': return sifatQuestion();
    default: return ruangQuestion(skill);
  }
}

const LABELS: Record<string, string> = {
  'fpb:list': 'FPB dengan daftar faktor',
  'fpb:tree': 'FPB dengan pohon faktor',
  'fpb:story': 'FPB soal cerita',
  'kpk:list': 'KPK dengan daftar kelipatan',
  'kpk:tree': 'KPK dengan pohon faktor',
  'kpk:story': 'KPK soal cerita',
  'pec:add': 'Tambah pecahan',
  'pec:sub': 'Kurang pecahan',
  'pec:mixed': 'Pecahan campuran',
  'pec:mul': 'Kali pecahan',
  'pec:div': 'Bagi pecahan',
  'pec:story': 'Pecahan soal cerita',
  'v:kubus': 'Volume kubus',
  'v:balok': 'Volume balok',
  'lp:kubus': 'Luas permukaan kubus',
  'lp:balok': 'Luas permukaan balok',
  'v:liter': 'Volume ke liter',
  'v:gabungan': 'Volume bangun gabungan',
  'v:prisma': 'Volume prisma segitiga',
  'v:limas': 'Volume limas',
  'v:tabung': 'Volume tabung',
  'lp:tabung': 'Luas permukaan tabung',
  'v:kerucut': 'Volume kerucut',
  'ruang:sifat': 'Sifat bangun ruang',
};

const S_FPB = ['fpb:list', 'fpb:tree', 'fpb:story'];
const S_KPK = ['kpk:list', 'kpk:tree', 'kpk:story'];
const S_PEC = ['pec:add', 'pec:sub', 'pec:mixed', 'pec:mul', 'pec:div', 'pec:story'];
const S_RUANG1 = ['ruang:sifat', 'v:kubus', 'v:balok', 'lp:kubus', 'lp:balok', 'v:liter', 'v:gabungan'];
const S_RUANG2 = ['v:prisma', 'v:limas', 'v:tabung', 'lp:tabung', 'v:kerucut'];

export const kelas6Config: MasteryConfig = {
  gameId: 'master6',
  title: 'Master Materi 6',
  emoji: '🎓',
  color: '#06b6d4',
  tagline: 'FPB, KPK, Pecahan, dan Bangun Ruang — belajar rumusnya, lalu latihan sampai jago!',
  sessionLength: 10,
  sequential: false,
  passAccuracy: 0.8,
  makeQuestion,
  skillLabel: (k) => LABELS[k] ?? k,
  groups: [
    {
      id: 'fpb',
      label: 'FPB',
      emoji: '🧩',
      skills: S_FPB,
      lesson: {
        title: 'Faktor Persekutuan Terbesar',
        points: [
          'FPB = bilangan TERBESAR yang bisa membagi habis kedua bilangan.',
          'Pohon faktor: ambil faktor prima yang SAMA dengan pangkat TERKECIL, lalu kalikan.',
          'Soal cerita: kata kunci "paling banyak", "paling panjang", "dibagi sama rata tanpa sisa".',
        ],
        example: 'FPB 12 dan 18 → 12 = 2² × 3, 18 = 2 × 3² → 2 × 3 = 6.',
      },
    },
    {
      id: 'kpk',
      label: 'KPK',
      emoji: '🔁',
      skills: S_KPK,
      lesson: {
        title: 'Kelipatan Persekutuan Terkecil',
        points: [
          'KPK = bilangan TERKECIL yang habis dibagi kedua bilangan.',
          'Pohon faktor: ambil SEMUA faktor prima dengan pangkat TERBESAR, lalu kalikan.',
          'Trik cepat: KPK × FPB = bilangan pertama × bilangan kedua.',
          'Soal cerita: kata kunci "bersama lagi", "berulang", "berbarengan".',
        ],
        example: 'KPK 4 dan 6 → kelipatan 4: 4, 8, 12 — kelipatan 6: 6, 12 → 12.',
      },
    },
    {
      id: 'pecahan',
      label: 'Pecahan',
      emoji: '🍕',
      skills: S_PEC,
      lesson: {
        title: 'Operasi Pecahan',
        points: [
          'Tambah / kurang: samakan penyebut dulu (pakai KPK penyebutnya), baru operasikan pembilang.',
          'Kali: pembilang × pembilang, penyebut × penyebut.',
          'Bagi: kali dengan KEBALIKAN pecahan kedua (Keep – Change – Flip).',
          'Pecahan campuran: ubah dulu ke pecahan biasa, misalnya 2 1/3 = 7/3.',
        ],
        example: '1/2 + 1/3 → 3/6 + 2/6 = 5/6.',
      },
    },
    {
      id: 'ruang1',
      label: 'Bangun Ruang 1',
      emoji: '📦',
      skills: S_RUANG1,
      lesson: {
        title: 'Kubus, Balok, dan Volume',
        points: [
          'Kubus: V = s × s × s, luas permukaan = 6 × s × s.',
          'Balok: V = p × l × t, luas permukaan = 2 × (pl + pt + lt).',
          '1 dm³ = 1 liter dan 1 cm³ = 1 mL.',
          'Bangun gabungan: hitung volume tiap bagian, lalu jumlahkan.',
        ],
        example: 'Balok 5 × 4 × 3 cm → V = 60 cm³.',
      },
    },
    {
      id: 'ruang2',
      label: 'Bangun Ruang 2',
      emoji: '🥫',
      skills: S_RUANG2,
      lesson: {
        title: 'Prisma, Limas, Tabung, Kerucut',
        points: [
          'Prisma: V = luas alas × tinggi prisma.',
          'Limas: V = 1/3 × luas alas × tinggi.',
          'Tabung: V = π × r × r × t, LP = 2 × π × r × (r + t).',
          'Kerucut: V = 1/3 × π × r × r × t.',
          'π = 22/7 dipakai jika r kelipatan 7; π = 3,14 jika r kelipatan 10.',
        ],
        example: 'Tabung r = 7, t = 10 → 22/7 × 7 × 7 × 10 = 1.540 cm³.',
      },
    },
    {
      id: 'master',
      label: 'Ujian Master',
      emoji: '🏆',
      skills: [...S_FPB, ...S_KPK, ...S_PEC, ...S_RUANG1, ...S_RUANG2],
      lesson: {
        title: 'Semua materi diacak',
        points: [
          'FPB, KPK, pecahan, dan bangun ruang bercampur.',
          'Soal yang masih lemah lebih sering muncul.',
        ],
      },
    },
  ],
};
