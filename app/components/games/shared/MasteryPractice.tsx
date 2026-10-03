// app/components/games/shared/MasteryPractice.tsx
// 🎯 Mesin latihan penguasaan: menu tahap → belajar singkat → latihan adaptif → ringkasan.
// Dipakai oleh Jagoan Berhitung (Kelas 1), Perkalian Kilat (Kelas 3), dan Master Materi 6 (Kelas 6).
'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { MasteryConfig, MasteryQuestion, VisualSpec } from '@/lib/mastery/types';
import * as core from '@/lib/mastery/core';

interface Props {
  config: MasteryConfig;
  playerName?: string;
  onComplete: (stars: number, extra?: any) => void;
}

type View = 'home' | 'group' | 'play' | 'summary';
type Phase = 'answering' | 'correct' | 'wrong' | 'fixed';

interface Session {
  groupId: string; // 'smart' atau id tahap
  pool: string[];
  asked: number;
  firstOk: number;
  streak: number;
  best: number;
  score: number;
  ms: number[];
  queue: { skill: string; due: number }[];
  cur: { skill: string; q: MasteryQuestion; retry: boolean };
  last?: string;
  weak: string[];
  startPct: number;
  endPct: number;
  newlyUnlocked?: string;
}

const normalize = (s: string) => s.trim().replace(',', '.').replace(/\s+/g, ' ');

// ---------- tampilan kecil ----------
function Frac({ s }: { s: string }) {
  const [n, d] = s.split('/');
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        verticalAlign: 'middle',
        margin: '0 3px',
        lineHeight: 1.1,
        fontSize: '0.82em',
      }}
    >
      <span style={{ padding: '0 3px', borderBottom: '2px solid currentColor' }}>{n}</span>
      <span style={{ padding: '0 3px' }}>{d}</span>
    </span>
  );
}

/** Teks dengan pola "3/4" otomatis jadi pecahan bertumpuk */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\d+\/\d+)/g);
  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {parts.map((p, i) => (i % 2 === 1 ? <Frac key={i} s={p} /> : <Fragment key={i}>{p}</Fragment>))}
    </span>
  );
}

function Frame({ filled, emoji, border }: { filled: number; emoji: string; border: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 30px)',
        gridAutoRows: '30px',
        gap: '2px',
        padding: '4px',
        border: `2px solid ${border}`,
        borderRadius: '8px',
      }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${border}`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          {i < filled ? emoji : ''}
        </div>
      ))}
    </div>
  );
}

function Visual({ v, border, dot }: { v: VisualSpec; border: string; dot: string }) {
  if (v.kind === 'emoji') {
    return <div style={{ fontSize: '30px', lineHeight: 1.4, whiteSpace: 'pre-line', marginBottom: '10px' }}>{v.text}</div>;
  }
  if (v.kind === 'tenframes') {
    const frames = Math.ceil(v.count / 10);
    return (
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
        {Array.from({ length: frames }, (_, i) => (
          <Frame key={i} filled={Math.min(10, v.count - i * 10)} emoji={v.emoji} border={border} />
        ))}
      </div>
    );
  }
  if (v.kind === 'bond') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <Frame filled={v.part} emoji="🔵" border={border} />
      </div>
    );
  }
  if (v.kind === 'crossed') {
    const left = v.total - v.crossed;
    return (
      <div style={{ fontSize: '28px', lineHeight: 1.4, marginBottom: '10px' }}>
        {v.emoji.repeat(left)}
        {'❌'.repeat(v.crossed)}
      </div>
    );
  }
  // array
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${v.cols}, 14px)`, gap: '4px', margin: '6px 0' }}>
      {Array.from({ length: v.rows * v.cols }, (_, i) => (
        <span key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: dot }} />
      ))}
    </div>
  );
}

const BOX_COLORS = ['#fca5a5', '#fdba74', '#fde047', '#bef264', '#4ade80'];

function Heatmap({ config, state, empty }: { config: MasteryConfig; state: core.MasteryState; empty: string }) {
  const h = config.heatmap;
  if (!h) return null;
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '12px', fontWeight: 800, textAlign: 'center', margin: '0 0 6px' }}>{h.title}</p>
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `20px repeat(${h.axis.length}, 26px)`,
            gap: '2px',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
          }}
        >
          <span />
          {h.axis.map((a) => (
            <span key={`c${a}`} style={{ textAlign: 'center' }}>{a}</span>
          ))}
          {h.axis.map((r) => (
            <Fragment key={`r${r}`}>
              <span style={{ alignSelf: 'center', textAlign: 'center' }}>{r}</span>
              {h.axis.map((c) => {
                const b = core.boxOf(state, h.keyFor(r, c));
                return (
                  <span
                    key={`${r}-${c}`}
                    title={`${r} × ${c}`}
                    style={{
                      height: '24px',
                      borderRadius: '5px',
                      background: b < 0 ? empty : BOX_COLORS[b],
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
        <span>⬜ belum dicoba</span>
        <span>🟥 lemah</span>
        <span>🟨 mulai bisa</span>
        <span>🟩 dikuasai</span>
      </div>
    </div>
  );
}

function Bar({ pct, color, track }: { pct: number; color: string; track: string }) {
  return (
    <div style={{ width: '100%', height: '8px', background: track, borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.round(pct * 100)}%`, height: '100%', background: color, transition: 'width 0.5s' }} />
    </div>
  );
}

function Numpad({
  onDigit,
  onBack,
  onOk,
  disabled,
  bg,
  text,
  color,
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
  onOk: () => void;
  disabled: boolean;
  bg: string;
  text: string;
  color: string;
}) {
  const base = {
    padding: '13px 0',
    fontSize: '22px',
    fontWeight: 800,
    borderRadius: '12px',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
  } as const;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '260px', margin: '0 auto' }}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} disabled={disabled} onClick={() => onDigit(d)} style={{ ...base, background: bg, color: text }}>
          {d}
        </button>
      ))}
      <button disabled={disabled} onClick={onBack} style={{ ...base, background: bg, color: text }}>⌫</button>
      <button disabled={disabled} onClick={() => onDigit('0')} style={{ ...base, background: bg, color: text }}>0</button>
      <button disabled={disabled} onClick={onOk} style={{ ...base, background: color, color: '#fff' }}>✔</button>
    </div>
  );
}

// ---------- komponen utama ----------
export default function MasteryPractice({ config, playerName, onComplete }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();
  const key = useMemo(() => core.storageKey(config.gameId, playerName), [config.gameId, playerName]);

  const [state, setState] = useState<core.MasteryState>(() => core.loadState(key));
  const [view, setView] = useState<View>('home');
  const [groupId, setGroupId] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [typed, setTyped] = useState('');
  const [shake, setShake] = useState(false);

  const stateRef = useRef(state);
  const sessionRef = useRef(session);
  const phaseRef = useRef(phase);
  const typedRef = useRef(typed);
  const startRef = useRef(0);
  const claimedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  stateRef.current = state;
  sessionRef.current = session;
  phaseRef.current = phase;
  typedRef.current = typed;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const all = useMemo(() => core.allSkills(config), [config]);
  const overall = core.progressOf(state, all);
  const masteredN = core.masteredCount(state, all);

  const commit = (ns: core.MasteryState) => {
    stateRef.current = ns;
    setState(ns);
    core.saveState(key, ns);
  };

  // ----- mulai sesi -----
  const draw = (
    pool: string[],
    queue: { skill: string; due: number }[],
    asked: number,
    last: string | undefined
  ) => {
    const q = [...queue];
    let skill: string;
    let retry = false;
    let idx = q.findIndex((x) => x.due <= asked);
    if (idx < 0 && asked >= config.sessionLength && q.length > 0) idx = 0;
    if (idx >= 0) {
      skill = q[idx].skill;
      q.splice(idx, 1);
      retry = true;
    } else {
      skill = core.pickSkill(pool, stateRef.current, last);
    }
    return { skill, retry, queue: q, question: config.makeQuestion(skill) };
  };

  const startSession = (gid: string) => {
    const group = gid === 'smart' ? undefined : core.groupById(config, gid);
    const pool = group ? group.skills : core.unlockedSkills(config, stateRef.current);
    const d = draw(pool, [], 0, undefined);
    claimedRef.current = false;
    const startPct = core.progressOf(stateRef.current, all);
    setSession({
      groupId: gid,
      pool,
      asked: 1,
      firstOk: 0,
      streak: 0,
      best: 0,
      score: 0,
      ms: [],
      queue: d.queue,
      cur: { skill: d.skill, q: d.question, retry: false },
      last: d.skill,
      weak: [],
      startPct,
      endPct: startPct,
    });
    setPhase('answering');
    setTyped('');
    startRef.current = performance.now();
    setView('play');
    playSound('click');
  };

  const finishSession = (s: Session) => {
    const acc = s.asked > 0 ? s.firstOk / s.asked : 0;
    let ns = { ...stateRef.current, sessions: stateRef.current.sessions + 1 };
    let newlyUnlocked: string | undefined;
    if (s.groupId !== 'smart' && acc >= config.passAccuracy && !ns.passed[s.groupId]) {
      ns = { ...ns, passed: { ...ns.passed, [s.groupId]: true } };
      if (config.sequential) {
        const i = config.groups.findIndex((g) => g.id === s.groupId);
        const next = config.groups[i + 1];
        if (next) newlyUnlocked = `${next.emoji} ${next.label}`;
      }
    }
    commit(ns);
    const endPct = core.progressOf(ns, all);
    setSession({ ...s, endPct, newlyUnlocked });
    setView('summary');
    playSound(core.sessionStars(acc) === 3 ? 'win' : 'reward');
  };

  const advance = () => {
    const s = sessionRef.current;
    if (!s) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const finished = s.asked >= config.sessionLength && s.queue.length === 0;
    if (finished) {
      finishSession(s);
      return;
    }
    const d = draw(s.pool, s.queue, s.asked, s.last);
    setSession({
      ...s,
      asked: d.retry ? s.asked : s.asked + 1,
      queue: d.queue,
      cur: { skill: d.skill, q: d.question, retry: d.retry },
      last: d.skill,
    });
    setPhase('answering');
    setTyped('');
    startRef.current = performance.now();
  };

  // ----- jawab -----
  const submit = (value: string) => {
    const s = sessionRef.current;
    if (!s || phaseRef.current !== 'answering' || value === '') return;
    const q = s.cur.q;
    const ms = performance.now() - startRef.current;
    const ok = normalize(value) === normalize(q.answer);
    commit(core.applyAnswer(stateRef.current, s.cur.skill, ok, ms, q.fastMs));

    let next = { ...s };
    if (ok) {
      playSound('correct');
      if (!s.cur.retry) {
        const fast = q.fastMs !== undefined && ms <= q.fastMs;
        const streak = s.streak + 1;
        next = {
          ...s,
          firstOk: s.firstOk + 1,
          streak,
          best: Math.max(s.best, streak),
          score: s.score + 10 + (fast ? 5 : 0) + Math.min(streak - 1, 5) * 2,
          ms: [...s.ms, ms],
        };
      }
      setSession(next);
      setPhase('correct');
      timerRef.current = setTimeout(() => advance(), 900);
    } else {
      playSound('wrong');
      if (!s.cur.retry) {
        next = {
          ...s,
          streak: 0,
          ms: [...s.ms, ms],
          weak: s.weak.includes(s.cur.skill) ? s.weak : [...s.weak, s.cur.skill],
          queue: [...s.queue, { skill: s.cur.skill, due: s.asked + 3 }],
        };
      }
      setSession(next);
      setPhase('wrong');
      setTyped('');
    }
  };

  const submitFix = (value: string) => {
    const s = sessionRef.current;
    if (!s || phaseRef.current !== 'wrong') return;
    if (normalize(value) === normalize(s.cur.q.answer)) {
      playSound('match');
      setPhase('fixed');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setTyped('');
    }
  };

  const onOk = () => {
    if (phaseRef.current === 'answering') submit(typedRef.current);
    else if (phaseRef.current === 'wrong') submitFix(typedRef.current);
  };

  const handlersRef = useRef({ onOk, advance });
  handlersRef.current = { onOk, advance };

  // keyboard (perangkat dengan papan ketik)
  useEffect(() => {
    if (view !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      const s = sessionRef.current;
      if (!s) return;
      const p = phaseRef.current;
      if (p === 'correct' || p === 'fixed') {
        if (e.key === 'Enter') handlersRef.current.advance();
        return;
      }
      if (s.cur.q.input !== 'number') return;
      if (/^\d$/.test(e.key)) setTyped((t) => (t.length < 7 ? t + e.key : t));
      else if (e.key === 'Backspace') setTyped((t) => t.slice(0, -1));
      else if (e.key === 'Enter') handlersRef.current.onOk();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  const claim = () => {
    const s = sessionRef.current;
    if (!s || claimedRef.current) return;
    claimedRef.current = true;
    const acc = s.asked > 0 ? s.firstOk / s.asked : 0;
    const stars = core.sessionStars(acc);
    const avg = s.ms.length ? s.ms.reduce((a, b) => a + b, 0) / s.ms.length : 0;
    onComplete(stars, {
      score: s.score,
      streak: s.best,
      total: s.asked,
      correctAnswers: s.firstOk,
      accuracy: Math.round(acc * 100),
      mastery: core.progressOf(stateRef.current, all),
      masteredCount: core.masteredCount(stateRef.current, all),
      avgMs: Math.round(avg),
      bossCleared: false,
    });
  };

  // ---------- gaya ----------
  const card = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: '18px',
    padding: '16px',
    boxShadow: theme.shadowSm,
  } as const;
  const primaryBtn = {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: config.color,
    color: '#fff',
    fontWeight: 800,
    fontSize: '16px',
    cursor: 'pointer',
  } as const;
  const ghostBtn = {
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '7px 12px',
    fontSize: '13px',
    fontWeight: 700,
    color: theme.textSecondary,
    cursor: 'pointer',
  } as const;

  // ================= HOME =================
  if (view === 'home') {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ ...card, textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '38px' }}>{config.emoji}</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>{config.title}</h2>
          <p style={{ fontSize: '13px', color: theme.textSecondary, margin: '0 0 12px' }}>{config.tagline}</p>
          <Bar pct={overall} color={config.color} track={theme.border} />
          <p style={{ fontSize: '12px', color: theme.textMuted, margin: '6px 0 0' }}>
            Penguasaan {Math.round(overall * 100)}% · {masteredN} dari {all.length} kemampuan sudah dikuasai
          </p>
        </div>

        {config.heatmap && (
          <div style={{ ...card, marginBottom: '12px', color: theme.text }}>
            <Heatmap config={config} state={state} empty={theme.border} />
          </div>
        )}

        <button onClick={() => startSession('smart')} style={{ ...primaryBtn, marginBottom: '12px' }}>
          🎯 Latihan Cerdas — {config.sessionLength} soal
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
          {config.groups.map((g, i) => {
            const unlocked = core.isGroupUnlocked(config, state, i);
            const pct = core.progressOf(state, g.skills);
            const passed = !!state.passed[g.id];
            return (
              <button
                key={g.id}
                disabled={!unlocked}
                onClick={() => {
                  setGroupId(g.id);
                  setView('group');
                  playSound('click');
                }}
                style={{
                  ...card,
                  textAlign: 'left',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.55,
                  color: theme.text,
                }}
              >
                <div style={{ fontSize: '22px' }}>{unlocked ? g.emoji : '🔒'}</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: theme.heading, margin: '2px 0 6px' }}>{g.label}</div>
                <Bar pct={pct} color={passed ? '#10b981' : config.color} track={theme.border} />
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                  {!unlocked ? 'Lulus tahap sebelumnya dulu' : passed ? `✅ Lulus · ${Math.round(pct * 100)}%` : `${Math.round(pct * 100)}%`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= GROUP (belajar dulu) =================
  if (view === 'group') {
    const g = core.groupById(config, groupId);
    if (!g) return null;
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => setView('home')} style={{ ...ghostBtn, marginBottom: '10px' }}>← Menu</button>
        <div style={{ ...card, marginBottom: '12px' }}>
          <div style={{ fontSize: '30px' }}>{g.emoji}</div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: theme.heading, margin: '2px 0 8px' }}>
            {g.lesson?.title ?? g.label}
          </h3>
          {g.lesson && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 800, color: config.color, margin: '0 0 6px' }}>📖 BELAJAR DULU</p>
              <ul style={{ margin: 0, paddingLeft: '18px', color: theme.text, fontSize: '14px', lineHeight: 1.7 }}>
                {g.lesson.points.map((p, i) => (
                  <li key={i}><Rich text={p} /></li>
                ))}
              </ul>
              {g.lesson.example && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: theme.bgHover,
                    fontSize: '14px',
                    color: theme.text,
                  }}
                >
                  <strong>Contoh: </strong><Rich text={g.lesson.example} />
                </div>
              )}
            </>
          )}
          <div style={{ marginTop: '12px' }}>
            <Bar pct={core.progressOf(state, g.skills)} color={config.color} track={theme.border} />
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '4px 0 0' }}>
              Penguasaan tahap ini {Math.round(core.progressOf(state, g.skills) * 100)}%
              {config.sequential ? ` · lulus jika benar ≥ ${Math.round(config.passAccuracy * 100)}% di percobaan pertama` : ''}
            </p>
          </div>
        </div>
        <button onClick={() => startSession(g.id)} style={primaryBtn}>▶ Mulai Latihan — {config.sessionLength} soal</button>
      </div>
    );
  }

  // ================= PLAY =================
  if (view === 'play' && session) {
    const { q, retry } = session.cur;
    const shown = Math.min(session.asked, config.sessionLength);
    const locked = phase === 'correct' || phase === 'fixed';
    const showExplain = phase === 'wrong' || phase === 'fixed';
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
          <button
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setView('home');
            }}
            style={ghostBtn}
          >
            ✕ Keluar
          </button>
          <span style={{ fontSize: '13px', fontWeight: 800, color: theme.heading }}>Soal {shown}/{config.sessionLength}</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', minWidth: '52px', textAlign: 'right' }}>
            {session.streak >= 2 ? `🔥 ${session.streak}x` : ''}
          </span>
        </div>
        <Bar pct={shown / config.sessionLength} color={config.color} track={theme.border} />

        <div style={{ ...card, textAlign: 'center', margin: '12px 0', color: theme.text }}>
          {retry && (
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
              🔁 Ayo coba lagi soal yang tadi!
            </div>
          )}
          {q.visual && <Visual v={q.visual} border={theme.inputBorder} dot={config.color} />}
          <div style={{ fontSize: q.prompt.length > 40 ? '17px' : '26px', fontWeight: 900, color: theme.heading, lineHeight: 1.5 }}>
            <Rich text={q.prompt} />
          </div>
          {q.unit && <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>satuan: {q.unit}</div>}
        </div>

        {phase === 'correct' && (
          <div style={{ padding: '10px', borderRadius: '12px', textAlign: 'center', marginBottom: '10px', background: theme.successBg, color: theme.success, fontWeight: 800 }}>
            🎉 Benar!{q.fastMs !== undefined && session.ms.length > 0 && session.ms[session.ms.length - 1] <= q.fastMs && !retry ? ' ⚡ Kilat!' : ''}
          </div>
        )}

        {showExplain && (
          <div style={{ ...card, marginBottom: '10px', background: theme.warningBg, border: `1px solid ${theme.warningBorder}`, color: theme.text }}>
            {phase === 'wrong' && (
              <p style={{ margin: '0 0 6px', fontWeight: 900, color: theme.heading }}>
                Belum tepat — tidak apa-apa, kita pelajari! 💪
              </p>
            )}
            <p style={{ margin: '0 0 6px', fontWeight: 800 }}>Jawaban: <Rich text={q.answer} />{q.unit ? ` ${q.unit}` : ''}</p>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.7 }}>
              {q.explain.map((line, i) => (
                <li key={i}><Rich text={line} /></li>
              ))}
            </ol>
            {q.explainVisual && (
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Visual v={q.explainVisual} border={theme.inputBorder} dot={config.color} />
              </div>
            )}
            {phase === 'wrong' && (
              <p style={{ margin: '10px 0 0', fontWeight: 800, color: config.color }}>
                ✍️ Sekarang {q.input === 'number' ? 'ketik' : 'pilih'} jawaban yang benar:
              </p>
            )}
          </div>
        )}

        {q.input === 'number' ? (
          <div style={{ animation: shake ? 'kaShake 0.3s' : undefined }}>
            <div
              style={{
                textAlign: 'center',
                fontSize: '30px',
                fontWeight: 900,
                color: theme.heading,
                background: theme.input,
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '14px',
                padding: '8px',
                maxWidth: '260px',
                margin: '0 auto 10px',
                minHeight: '52px',
              }}
            >
              {typed || <span style={{ color: theme.placeholder }}>…</span>}
            </div>
            <Numpad
              disabled={locked}
              bg={theme.bgHover}
              text={theme.text}
              color={config.color}
              onDigit={(d) => setTyped((t) => (t.length < 7 ? t + d : t))}
              onBack={() => setTyped((t) => t.slice(0, -1))}
              onOk={onOk}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', animation: shake ? 'kaShake 0.3s' : undefined }}>
            {(q.choices || []).map((c) => {
              const isAns = normalize(c) === normalize(q.answer);
              const reveal = phase !== 'answering';
              return (
                <button
                  key={c}
                  disabled={phase === 'correct' || phase === 'fixed'}
                  onClick={() => {
                    if (phase === 'answering') submit(c);
                    else if (phase === 'wrong') {
                      if (isAns) submitFix(c);
                      else {
                        setShake(true);
                        setTimeout(() => setShake(false), 350);
                      }
                    }
                  }}
                  style={{
                    padding: '14px 8px',
                    fontSize: '20px',
                    fontWeight: 800,
                    borderRadius: '14px',
                    border: reveal && isAns ? '3px solid #10b981' : `2px solid ${theme.border}`,
                    background: reveal && isAns ? theme.successBg : theme.bgHover,
                    color: theme.text,
                    cursor: 'pointer',
                  }}
                >
                  <Rich text={c} />
                </button>
              );
            })}
          </div>
        )}

        {(phase === 'fixed' || phase === 'correct') && (
          <button onClick={advance} style={{ ...primaryBtn, marginTop: '12px' }}>
            {session.asked >= config.sessionLength && session.queue.length === 0 ? 'Lihat Hasil ▶' : 'Lanjut ▶'}
          </button>
        )}

        <style>{`@keyframes kaShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
      </div>
    );
  }

  // ================= SUMMARY =================
  if (view === 'summary' && session) {
    const acc = session.asked > 0 ? session.firstOk / session.asked : 0;
    const stars = core.sessionStars(acc);
    const avg = session.ms.length ? session.ms.reduce((a, b) => a + b, 0) / session.ms.length / 1000 : 0;
    const delta = Math.round((session.endPct - session.startPct) * 100);
    const weak = core.weakestSkills(state, session.pool, 3);
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ ...card, marginBottom: '12px' }}>
          <div style={{ fontSize: '46px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>
            {stars === 3 ? 'Luar biasa!' : stars === 2 ? 'Bagus sekali!' : 'Terus berlatih, kamu makin jago!'}
          </h3>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 10px' }}>
            {session.firstOk} dari {session.asked} soal benar di percobaan pertama ({Math.round(acc * 100)}%)
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '13px', fontWeight: 700, color: theme.text }}>
            <span>🏅 {session.score} poin</span>
            <span>🔥 streak terbaik {session.best}</span>
            {avg > 0 && <span>⏱️ rata-rata {avg.toFixed(1)} dtk</span>}
          </div>
          <div style={{ marginTop: '12px' }}>
            <Bar pct={session.endPct} color={config.color} track={theme.border} />
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '4px 0 0' }}>
              Penguasaan {Math.round(session.endPct * 100)}%{delta > 0 ? ` (naik ${delta}%)` : ''}
            </p>
          </div>
          {session.newlyUnlocked && (
            <p style={{ marginTop: '10px', fontWeight: 800, color: '#10b981' }}>🔓 Tahap baru terbuka: {session.newlyUnlocked}</p>
          )}
          {session.groupId !== 'smart' && !session.newlyUnlocked && config.sequential && acc < config.passAccuracy && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: theme.textSecondary }}>
              Untuk lulus tahap ini, capai benar ≥ {Math.round(config.passAccuracy * 100)}% di percobaan pertama. Coba lagi ya!
            </p>
          )}
        </div>

        {weak.length > 0 && (
          <div style={{ ...card, marginBottom: '12px', textAlign: 'left' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '13px', color: theme.heading }}>🎯 Yang perlu dilatih lagi:</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {weak.map((k) => (
                <span key={k} style={{ background: theme.bgHover, color: theme.text, borderRadius: '999px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                  <Rich text={config.skillLabel(k)} />
                </span>
              ))}
            </div>
          </div>
        )}

        {config.heatmap && (
          <div style={{ ...card, marginBottom: '12px', color: theme.text }}>
            <Heatmap config={config} state={state} empty={theme.border} />
          </div>
        )}

        <button onClick={claim} style={primaryBtn}>⭐ Ambil Hadiah</button>
      </div>
    );
  }

  return null;
}
