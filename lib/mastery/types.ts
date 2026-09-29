// lib/mastery/types.ts
// Tipe untuk "Mesin Penguasaan" — latihan adaptif (Leitner) untuk Kelas 1, 3, dan 6.

export type InputKind = 'number' | 'choice';

/** Gambar bantu yang dirender mesin (data murni, tanpa React) */
export type VisualSpec =
  | { kind: 'emoji'; text: string }
  | { kind: 'tenframes'; count: number; emoji: string }
  | { kind: 'bond'; whole: number; part: number }
  | { kind: 'crossed'; total: number; crossed: number; emoji: string }
  | { kind: 'array'; rows: number; cols: number };

export interface MasteryQuestion {
  /** Teks soal. Pola "3/4" otomatis dirender sebagai pecahan bertumpuk. */
  prompt: string;
  visual?: VisualSpec;
  /** Jawaban benar dalam bentuk teks (dibandingkan setelah dinormalisasi) */
  answer: string;
  input: InputKind;
  choices?: string[];
  unit?: string;
  /** Langkah pembahasan — ditampilkan saat jawaban salah */
  explain: string[];
  /** Ambang "cepat" (ms) — jawaban benar tapi lambat tidak menaikkan level */
  fastMs?: number;
  /** Gambar bantu untuk pembahasan (mis. susunan titik perkalian) */
  explainVisual?: VisualSpec;
}

export interface Lesson {
  title: string;
  points: string[];
  example?: string;
}

export interface MasteryGroup {
  id: string;
  label: string;
  emoji: string;
  skills: string[];
  lesson?: Lesson;
}

export interface HeatmapSpec {
  title: string;
  axis: number[];
  keyFor: (a: number, b: number) => string;
}

export interface MasteryConfig {
  gameId: string;
  title: string;
  emoji: string;
  color: string;
  tagline: string;
  sessionLength: number;
  /** true = tahap berikutnya terbuka setelah tahap sebelumnya lulus */
  sequential: boolean;
  /** akurasi minimum sesi agar tahap dianggap lulus (0..1) */
  passAccuracy: number;
  groups: MasteryGroup[];
  makeQuestion: (skill: string) => MasteryQuestion;
  skillLabel: (skill: string) => string;
  heatmap?: HeatmapSpec;
}
