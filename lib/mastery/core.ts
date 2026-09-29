// lib/mastery/core.ts
// Logika inti penguasaan: kotak Leitner (0..4), pemilihan soal berbobot, penyimpanan lokal.
import type { MasteryConfig, MasteryGroup } from './types';

export const MAX_BOX = 4;

export interface SkillStat {
  box: number;
  seen: number;
  ok: number;
}

export interface MasteryState {
  skills: Record<string, SkillStat>;
  passed: Record<string, boolean>;
  sessions: number;
}

export function emptyState(): MasteryState {
  return { skills: {}, passed: {}, sessions: 0 };
}

export function storageKey(gameId: string, playerName?: string): string {
  return `kidarcade:mastery:${gameId}:${(playerName || 'tamu').toLowerCase()}`;
}

export function loadState(key: string): MasteryState {
  try {
    if (typeof window === 'undefined') return emptyState();
    const raw = window.localStorage.getItem(key);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyState();
    return {
      skills: parsed.skills && typeof parsed.skills === 'object' ? parsed.skills : {},
      passed: parsed.passed && typeof parsed.passed === 'object' ? parsed.passed : {},
      sessions: typeof parsed.sessions === 'number' ? parsed.sessions : 0,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(key: string, state: MasteryState): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* penyimpanan penuh / diblokir — abaikan */
  }
}

/** -1 = belum pernah dicoba, 0..4 = level penguasaan */
export function boxOf(state: MasteryState, skill: string): number {
  const s = state.skills[skill];
  if (!s || s.seen === 0) return -1;
  return s.box;
}

export function isMastered(box: number): boolean {
  return box >= 3;
}

/**
 * Benar & cepat → naik satu level. Benar tapi lambat → minimal level 1 (belum naik).
 * Salah → turun dua level (lembut, tidak langsung nol).
 */
export function applyAnswer(
  state: MasteryState,
  skill: string,
  correct: boolean,
  ms: number,
  fastMs?: number
): MasteryState {
  const prev = state.skills[skill] ?? { box: 0, seen: 0, ok: 0 };
  let box = prev.box;
  if (correct) {
    const fast = fastMs === undefined || ms <= fastMs;
    box = fast ? Math.min(MAX_BOX, box + 1) : Math.max(box, 1);
  } else {
    box = Math.max(0, box - 2);
  }
  return {
    ...state,
    skills: {
      ...state.skills,
      [skill]: { box, seen: prev.seen + 1, ok: prev.ok + (correct ? 1 : 0) },
    },
  };
}

/** 0..1 — rata-rata (level/4) seluruh skill */
export function progressOf(state: MasteryState, skills: string[]): number {
  if (skills.length === 0) return 0;
  let total = 0;
  for (const k of skills) {
    const b = boxOf(state, k);
    total += b < 0 ? 0 : b / MAX_BOX;
  }
  return total / skills.length;
}

export function masteredCount(state: MasteryState, skills: string[]): number {
  return skills.filter((k) => isMastered(boxOf(state, k))).length;
}

export function isGroupUnlocked(config: MasteryConfig, state: MasteryState, index: number): boolean {
  if (!config.sequential || index === 0) return true;
  return !!state.passed[config.groups[index - 1].id];
}

/** Semua skill unik dari tahap yang sudah terbuka */
export function unlockedSkills(config: MasteryConfig, state: MasteryState): string[] {
  const set = new Set<string>();
  config.groups.forEach((g, i) => {
    if (isGroupUnlocked(config, state, i)) g.skills.forEach((s) => set.add(s));
  });
  return Array.from(set);
}

export function allSkills(config: MasteryConfig): string[] {
  const set = new Set<string>();
  config.groups.forEach((g) => g.skills.forEach((s) => set.add(s)));
  return Array.from(set);
}

/**
 * Pilih skill berikutnya. Bobot: belum pernah = 6; level 0..4 = 9,7,5,3,1.
 * Skill yang barusan keluar dihindari (jika masih ada pilihan lain).
 */
export function pickSkill(
  pool: string[],
  state: MasteryState,
  avoid?: string,
  rng: () => number = Math.random
): string {
  const candidates = pool.length > 1 && avoid ? pool.filter((s) => s !== avoid) : pool;
  const weights = candidates.map((s) => {
    const b = boxOf(state, s);
    return b < 0 ? 6 : (MAX_BOX - b) * 2 + 1;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function sessionStars(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.85) return 3;
  if (accuracy >= 0.6) return 2;
  return 1;
}

export function weakestSkills(state: MasteryState, skills: string[], n: number): string[] {
  const scored = skills
    .filter((k) => (state.skills[k]?.seen ?? 0) > 0)
    .map((k) => ({ k, b: state.skills[k].box, missed: state.skills[k].seen - state.skills[k].ok }))
    .sort((x, y) => x.b - y.b || y.missed - x.missed);
  return scored.slice(0, n).map((s) => s.k);
}

export function groupById(config: MasteryConfig, id: string): MasteryGroup | undefined {
  return config.groups.find((g) => g.id === id);
}
