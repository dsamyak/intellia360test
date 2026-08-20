"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";
import type { SubmitResponse, QuestionResult } from "@/app/api/student/daily-quiz/submit/route";
import type { DailyQuizResponse } from "@/app/api/student/daily-quiz/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizOption { id: string; text: string; }
interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  hint: string;
  topic: string;
  difficulty: string;
}

type Phase = "loading" | "intro" | "quiz" | "results" | "already-done";

// ─── Difficulty chip ──────────────────────────────────────────────────────────
const DIFF_COLOR: Record<string, string> = {
  easy:   "#10b981",
  medium: "#f59e0b",
  hard:   "#ef4444",
};

// ─── XP animation hook ───────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DailyQuizPage() {
  const { streakDays, addXp, addGems, unlockBadge } = useStudentContext();

  const [phase,      setPhase]      = useState<Phase>("loading");
  const [questions,  setQuestions]  = useState<QuizQuestion[]>([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [selected,   setSelected]   = useState<string | null>(null);
  const [revealed,   setRevealed]   = useState(false);
  const [showHint,   setShowHint]   = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(30);
  const [results,    setResults]    = useState<SubmitResponse | null>(null);
  const [dateKey,    setDateKey]    = useState("");
  const [todayStreak, setTodayStreak] = useState(streakDays);
  const [existingAttempt, setExistingAttempt] = useState<DailyQuizResponse["attempt"]>();
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Count-up animations for results ──────────────────────────────────────
  const xpCount  = useCountUp(results?.xpAwarded   ?? 0);
  const gemCount = useCountUp(results?.gemsAwarded  ?? 0);

  // ── Load quiz ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/student/daily-quiz")
      .then(r => r.json())
      .then((json) => {
        if (!json.success) { setPhase("intro"); return; }
        const d: DailyQuizResponse = json.data;
        setDateKey(d.dateKey);
        setTodayStreak(d.streakDays);
        setQuestions(d.questions as QuizQuestion[]);
        if (d.alreadyCompleted && d.attempt) {
          setExistingAttempt(d.attempt);
          setPhase("already-done");
        } else {
          setPhase("intro");
        }
      })
      .catch(() => setPhase("intro"));
  }, []);

  // ── Per-question countdown timer ──────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-advance with blank answer
          setRevealed(true);
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => { return () => clearTimer(); }, [clearTimer]);

  // ── Start quiz ────────────────────────────────────────────────────────────
  function startQuiz() {
    setCurrent(0);
    setAnswers({});
    setSelected(null);
    setRevealed(false);
    setShowHint(false);
    setPhase("quiz");
    startTimer();
  }

  // ── Select an answer ──────────────────────────────────────────────────────
  function handleSelect(optionId: string) {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    clearTimer();
    setAnswers(prev => ({ ...prev, [questions[current].id]: optionId }));
  }

  // ── Next question ─────────────────────────────────────────────────────────
  function handleNext() {
    const nextIdx = current + 1;
    if (nextIdx < questions.length) {
      setCurrent(nextIdx);
      setSelected(null);
      setRevealed(false);
      setShowHint(false);
      startTimer();
    } else {
      handleSubmit();
    }
  }

  // ── Submit answers ────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/daily-quiz/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const data: SubmitResponse = json.data;
        setResults(data);
        setPhase("results");
        // Sync context state
        if (data.xpAwarded  > 0) addXp(data.xpAwarded);
        if (data.gemsAwarded > 0) addGems(data.gemsAwarded);
        data.newBadges?.forEach(b => unlockBadge(b.badgeId));
      }
    } catch {}
    setSubmitting(false);
  }

  // ─── Colours ───────────────────────────────────────────────────────────────
  const orangeGrad = "linear-gradient(135deg,#f97316,#ea580c)";
  const purpleGrad = "linear-gradient(135deg,#7c3aed,#6d28d9)";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={centreWrap}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
        <p style={{ color: "#64748b" }}>Loading today's quiz…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Already done ────────────────────────────────────────────────────────────
  if (phase === "already-done" && existingAttempt) {
    return (
      <div style={centreWrap}>
        <div style={card}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
          <h1 style={h1Style}>Already Completed!</h1>
          <p style={subtitleStyle}>You finished today's Daily Quiz on {dateKey}.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", margin:"16px 0" }}>
            <div style={scorePill("#f97316")}>⭐ +{existingAttempt.xpAwarded} XP</div>
            <div style={scorePill("#7c3aed")}>💎 +{existingAttempt.gemsAwarded} Gems</div>
          </div>
          <div style={{ fontSize: "1rem", color: "#64748b", margin: "12px 0 24px" }}>
            Score: {existingAttempt.score}/5 · Day streak: 🔥{existingAttempt.streakDay}
          </div>
          <p style={{ fontSize: ".85rem", color: "#9ca3af", marginBottom: 20 }}>
            Come back tomorrow for a new set of questions!
          </p>
          <Link href="/student/dashboard" style={btnPrimary(orangeGrad)}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // ── Intro ───────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const dateStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric" });
    return (
      <div style={centreWrap}>
        <div style={{ ...card, maxWidth: 500 }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🎯</div>
          <h1 style={h1Style}>Daily Quiz</h1>
          <p style={subtitleStyle}>{dateStr}</p>

          <div style={{ display:"flex", gap:10, justifyContent:"center", margin:"16px 0" }}>
            <div style={infoPill("#f97316","rgba(249,115,22,.10)")}>5 Questions</div>
            <div style={infoPill("#7c3aed","rgba(124,58,237,.10)")}>30 sec each</div>
            <div style={infoPill("#10b981","rgba(16,185,129,.10)")}>🔥 Day {todayStreak}</div>
          </div>

          {/* Streak milestone preview */}
          <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px 16px", marginBottom:20, textAlign:"left" }}>
            <p style={{ fontSize:".8rem", fontWeight:700, color:"#475569", margin:"0 0 8px" }}>🏅 Streak Milestones</p>
            {[
              { days:3,  emoji:"🎩", label:"Hat Trick"       },
              { days:7,  emoji:"🔥", label:"Week Warrior"    },
              { days:14, emoji:"⚡", label:"Fortnight Champ" },
              { days:30, emoji:"🏅", label:"Monthly Master"  },
            ].map(m => (
              <div key={m.days} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:".8rem" }}>
                <span>{todayStreak >= m.days ? "✅" : "⭕"}</span>
                <span>{m.emoji}</span>
                <span style={{ color: todayStreak >= m.days ? "#10b981" : "#9ca3af" }}>
                  {m.label} ({m.days} days)
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={startQuiz} style={{ ...btnPrimary(orangeGrad), width:"100%" }}>
              Start Today&apos;s Quiz →
            </button>
            <Link href="/student/dashboard" style={{ ...btnSecondary, textAlign:"center", textDecoration:"none" }}>
              Maybe later
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  if (phase === "quiz" && questions.length > 0) {
    const q      = questions[current];
    const pct    = ((current) / questions.length) * 100;
    const timerPct = (timeLeft / 30) * 100;
    const timerColor = timeLeft > 10 ? "#10b981" : timeLeft > 5 ? "#f59e0b" : "#ef4444";

    return (
      <div style={centreWrap}>
        <div style={{ ...card, maxWidth: 580 }}>
          {/* Progress */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:".8rem", fontWeight:600, color:"#64748b" }}>
              Question {current+1} of {questions.length}
            </span>
            <span style={{ fontSize:".8rem", fontWeight:700, color:"#f97316" }}>🔥 Day {todayStreak}</span>
          </div>
          <div style={{ height:6, background:"#f1f5f9", borderRadius:3, marginBottom:16, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:orangeGrad, borderRadius:3, transition:"width .3s" }} />
          </div>

          {/* Timer bar */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${timerPct}%`, background:timerColor, borderRadius:4, transition:"width 1s linear" }} />
            </div>
            <span style={{ fontSize:".9rem", fontWeight:700, color:timerColor, minWidth:28, textAlign:"right" }}>
              {timeLeft}s
            </span>
          </div>

          {/* Topic + difficulty */}
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:".72rem", fontWeight:600, padding:"3px 9px", borderRadius:20, background:"rgba(124,58,237,.10)", color:"#7c3aed" }}>
              {q.topic}
            </span>
            <span style={{ fontSize:".72rem", fontWeight:600, padding:"3px 9px", borderRadius:20,
              background:`${DIFF_COLOR[q.difficulty]}18`, color:DIFF_COLOR[q.difficulty] }}>
              {q.difficulty}
            </span>
          </div>

          {/* Question */}
          <h2 style={{ fontSize:"1.05rem", fontWeight:800, color:"#1e1b4b", margin:"0 0 18px", lineHeight:1.5 }}>
            {q.questionText}
          </h2>

          {/* Options */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {q.options.map((opt) => {
              let bg = "#fff", border = "#e5e7eb", color = "#1e1b4b";
              if (revealed) {
                const isCorrectOpt = results?.results?.find(r => r.questionId === q.id)?.correctOptionId === opt.id
                  // during quiz we don't have results yet — use selected state
                  ? true : false;
                // We need to show correct during quiz before submission
                // We'll flag correct by checking against what we submitted
                // NOTE: server validates later; here we show visually only
                const wasSelected = selected === opt.id;
                if (wasSelected) {
                  bg = "#fff7ed"; border = "#f97316"; color = "#ea580c";
                }
              } else {
                if (selected === opt.id) {
                  bg = "#eff6ff"; border = "#7c3aed"; color = "#7c3aed";
                }
              }
              return (
                <button key={opt.id} onClick={() => handleSelect(opt.id)}
                  style={{ padding:"13px 16px", borderRadius:10, border:`2px solid ${border}`,
                    background:bg, color, fontWeight:600, fontSize:".9rem",
                    cursor:revealed ? "default" : "pointer", transition:"all .15s", textAlign:"left" }}>
                  <span style={{ fontWeight:700, marginRight:8, color:"#9ca3af" }}>
                    {opt.id.toUpperCase()}.
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {!revealed && (
            <button onClick={() => setShowHint(h => !h)}
              style={{ fontSize:".8rem", color:"#7c3aed", fontWeight:600, border:"none", background:"none", cursor:"pointer", marginBottom:8 }}>
              {showHint ? "Hide Hint ▲" : "💡 Show Hint"}
            </button>
          )}
          {showHint && !revealed && (
            <div style={{ background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.20)", borderRadius:10, padding:"10px 14px", fontSize:".83rem", color:"#6d28d9", marginBottom:12 }}>
              💡 {q.hint}
            </div>
          )}

          {/* Reveal state */}
          {revealed && (
            <div style={{ marginBottom:12 }}>
              {selected ? (
                <div style={{ background:"rgba(249,115,22,.08)", border:"1px solid rgba(249,115,22,.25)", borderRadius:10, padding:"10px 14px", fontSize:".83rem", color:"#ea580c", fontWeight:600, marginBottom:8 }}>
                  ✅ Answer recorded
                </div>
              ) : (
                <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:".83rem", color:"#dc2626", fontWeight:600, marginBottom:8 }}>
                  ⏰ Time&apos;s up!
                </div>
              )}
            </div>
          )}

          {/* Next / Submit */}
          {revealed && (
            <button onClick={handleNext} disabled={submitting}
              style={{ ...btnPrimary(current < questions.length - 1 ? purpleGrad : orangeGrad), width:"100%", opacity:submitting ? .6 : 1 }}>
              {submitting ? "Submitting…" : current < questions.length - 1 ? "Next Question →" : "See Results 🎉"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  if (phase === "results" && results) {
    const pct  = Math.round((results.score / results.totalQuestions) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : pct >= 40 ? "📚" : "💪";
    const msg   = pct === 100 ? "Perfect Score!" : pct >= 80 ? "Great Work!" : pct >= 60 ? "Good Job!" : pct >= 40 ? "Keep Practising!" : "Don't Give Up!";

    return (
      <div style={centreWrap}>
        <div style={{ ...card, maxWidth: 560 }}>
          {/* Score hero */}
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:"3.5rem", marginBottom:8 }}>{emoji}</div>
            <h1 style={{ ...h1Style, fontSize:"1.4rem" }}>{msg}</h1>
            <p style={subtitleStyle}>{dateKey} · Day {results.streakDays} 🔥</p>

            {/* Score ring */}
            <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:100, height:100, borderRadius:"50%",
              background: pct === 100 ? "rgba(249,115,22,.12)" : pct >= 60 ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.10)",
              border:`4px solid ${pct===100?"#f97316":pct>=60?"#10b981":"#ef4444"}`,
              margin:"16px auto", flexDirection:"column", gap:2 }}>
              <span style={{ fontSize:"1.6rem", fontWeight:900, color:"#1e1b4b" }}>{results.score}/{results.totalQuestions}</span>
              <span style={{ fontSize:".7rem", color:"#9ca3af" }}>{pct}%</span>
            </div>
          </div>

          {/* Rewards row */}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:20 }}>
            <div style={scorePill("#f97316")}>⭐ +{xpCount} XP</div>
            <div style={scorePill("#7c3aed")}>💎 +{gemCount} Gems</div>
            {results.streakKept && (
              <div style={scorePill("#10b981")}>🔥 Streak kept!</div>
            )}
          </div>

          {/* New badges */}
          {results.newBadges?.length > 0 && (
            <div style={{ background:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(124,58,237,.08))",
              border:"1px solid rgba(249,115,22,.20)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
              <p style={{ fontSize:".8rem", fontWeight:700, color:"#7c3aed", margin:"0 0 10px" }}>
                🎖 New Badges Unlocked!
              </p>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {results.newBadges.map(b => (
                  <div key={b.badgeId} style={{ display:"flex", alignItems:"center", gap:7,
                    padding:"8px 12px", background:"#fff", borderRadius:10,
                    border:"1px solid rgba(249,115,22,.25)", fontSize:".82rem" }}>
                    <span style={{ fontSize:"1.3rem" }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontWeight:700, color:"#1e1b4b" }}>{b.title}</div>
                      <div style={{ fontSize:".7rem", color:"#64748b" }}>{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-question breakdown */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:".8rem", fontWeight:700, color:"#475569", margin:"0 0 8px" }}>Question Breakdown</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {results.results.map((r: QuestionResult, i: number) => (
                <div key={r.questionId} style={{ display:"flex", alignItems:"flex-start", gap:10,
                  padding:"10px 12px", borderRadius:10,
                  background: r.isCorrect ? "rgba(16,185,129,.06)" : "rgba(239,68,68,.06)",
                  border:`1px solid ${r.isCorrect?"rgba(16,185,129,.20)":"rgba(239,68,68,.20)"}` }}>
                  <span style={{ fontSize:"1rem", flexShrink:0 }}>{r.isCorrect ? "✅" : "❌"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:".8rem", fontWeight:600, color:"#1e1b4b", marginBottom:3 }}>
                      Q{i+1}: {r.questionText.slice(0, 60)}{r.questionText.length > 60 ? "…" : ""}
                    </div>
                    {!r.isCorrect && (
                      <div style={{ fontSize:".75rem", color:"#64748b" }}>
                        {r.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <Link href="/student/dashboard" style={{ ...btnPrimary(orangeGrad), textAlign:"center", textDecoration:"none" }}>
              ← Back to Dashboard
            </Link>
            <Link href="/student/rewards" style={{ ...btnSecondary, textAlign:"center", textDecoration:"none" }}>
              View All Badges
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const centreWrap: React.CSSProperties = {
  minHeight:       "100vh",
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  padding:         24,
  background:      "#f5f6fa",
};

const card: React.CSSProperties = {
  background:   "#fff",
  borderRadius: 20,
  padding:      "32px 28px",
  width:        "100%",
  maxWidth:     520,
  boxShadow:    "0 8px 40px rgba(30,27,75,.10)",
  textAlign:    "center" as const,
};

const h1Style: React.CSSProperties = {
  fontSize:    "1.6rem",
  fontWeight:  800,
  color:       "#1e1b4b",
  margin:      "0 0 6px",
  letterSpacing: "-.02em",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: ".9rem",
  color:    "#64748b",
  margin:   "0 0 4px",
};

function btnPrimary(bg: string): React.CSSProperties {
  return {
    display:       "inline-flex",
    alignItems:    "center",
    justifyContent:"center",
    gap:           8,
    padding:       "12px 24px",
    background:    bg,
    color:         "#fff",
    borderRadius:  12,
    border:        "none",
    fontSize:      ".9rem",
    fontWeight:    700,
    cursor:        "pointer",
    boxShadow:     "0 4px 14px rgba(249,115,22,.30)",
    transition:    "all .2s",
  };
}

const btnSecondary: React.CSSProperties = {
  display:       "inline-flex",
  alignItems:    "center",
  justifyContent:"center",
  padding:       "11px 24px",
  background:    "#fff",
  color:         "#475569",
  borderRadius:  12,
  border:        "1.5px solid #e5e7eb",
  fontSize:      ".87rem",
  fontWeight:    600,
  cursor:        "pointer",
};

function scorePill(color: string): React.CSSProperties {
  return {
    padding:      "6px 14px",
    borderRadius: 999,
    background:   `${color}18`,
    border:       `1px solid ${color}40`,
    color,
    fontWeight:   700,
    fontSize:     ".85rem",
  };
}

function infoPill(color: string, bg: string): React.CSSProperties {
  return {
    padding:      "5px 12px",
    borderRadius: 999,
    background:   bg,
    border:       `1px solid ${color}30`,
    color,
    fontWeight:   600,
    fontSize:     ".82rem",
  };
}
