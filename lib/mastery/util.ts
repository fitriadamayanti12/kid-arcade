// lib/mastery/util.ts
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

/** Semua faktor positif dari n, urut naik */
export function divisors(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
  return out;
}

/** Faktorisasi prima → { prima: pangkat } */
export function primeFactors(n: number): Record<number, number> {
  const res: Record<number, number> = {};
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      res[p] = (res[p] || 0) + 1;
      x = x / p;
    }
  }
  if (x > 1) res[x] = (res[x] || 0) + 1;
  return res;
}

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

export function sup(n: number): string {
  return String(n).split('').map((c) => SUP[c] ?? c).join('');
}

/** "2³ × 3²" — pangkat 1 tidak ditulis */
export function factorString(f: Record<number, number>): string {
  const primes = Object.keys(f).map(Number).sort((a, b) => a - b);
  return primes.map((p) => (f[p] > 1 ? `${p}${sup(f[p])}` : `${p}`)).join(' × ');
}

/** Ambil `count` pengecoh angka unik di dekat jawaban (dalam rentang min..max) */
export function nearbyNumbers(answer: number, count: number, min: number, max: number): number[] {
  const pool: number[] = [];
  for (let d = 1; d <= 6; d++) {
    if (answer - d >= min) pool.push(answer - d);
    if (answer + d <= max) pool.push(answer + d);
  }
  for (let v = min; v <= max && pool.length < count + 4; v++) {
    if (v !== answer && !pool.includes(v)) pool.push(v);
  }
  const near = pool.slice(0, Math.max(count + 2, 6));
  return shuffle(near).slice(0, count);
}

export function joinAnd(items: (string | number)[]): string {
  return items.join(', ');
}
