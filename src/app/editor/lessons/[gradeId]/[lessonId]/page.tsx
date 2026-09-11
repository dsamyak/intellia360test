"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LessonData {
  id:           string;
  title:        string;
  description:  string;
  chapterId:    string;
  chapterTitle: string;
  grade:        string;
  estimatedMinutes: number;
  completed:    boolean;
  locked:       boolean;
  heroVisualizer:     string;
  heroVisualizerData: Record<string, unknown>;
  modules: {
    eduNotes:           { enabled: boolean; url: string };
    architectureModule: { enabled: boolean; url: string };
    videoLesson:        { enabled: boolean; url: string };
    practiceModule:     { enabled: boolean; url: string };
  };
  previousLesson: { id: string; title: string } | null;
  nextLesson:     { id: string; title: string } | null;
}

export default function LessonEditorPage({
  params,
}: {
  params: Promise<{ gradeId: string; lessonId: string }>;
}) {
  const router = useRouter();
  const [gradeId, setGradeId]   = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lesson, setLesson]     = useState<LessonData | null>(null);
  const [raw, setRaw]           = useState("{}");
  const [tab, setTab]           = useState<"form" | "json">("form");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then(({ gradeId: g, lessonId: l }) => {
      setGradeId(g);
      setLessonId(l);
    });
  }, [params]);

  const load = useCallback(() => {
    if (!gradeId || !lessonId) return;
    fetch(`/api/editor/lessons/${gradeId}/${lessonId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setLesson(j.data as LessonData);
          setRaw(JSON.stringify(j.data, null, 2));
        }
      });
  }, [gradeId, lessonId]);

  useEffect(() => { load(); }, [load]);

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!lesson || !gradeId || !lessonId) return;
    setSaving(true); setMsg(null);
    const r = await fetch(`/api/editor/lessons/${gradeId}/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lesson),
    }).then((r) => r.json());
    setSaving(false);
    setMsg(r.success ? { type: "ok", text: "Saved!" } : { type: "err", text: r.message });
  }

  async function saveJson(e: React.FormEvent) {
    e.preventDefault();
    if (!gradeId || !lessonId) return;
    setSaving(true); setMsg(null);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { setMsg({ type: "err", text: "Invalid JSON" }); setSaving(false); return; }
    const r = await fetch(`/api/editor/lessons/${gradeId}/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    }).then((r) => r.json());
    setSaving(false);
    setMsg(r.success ? { type: "ok", text: "Saved!" } : { type: "err", text: r.message });
    if (r.success) load();
  }

  if (!lesson) return <div className="ed-empty" style={{ marginTop: 60 }}>Loading lesson…</div>;

  function inp(
    label: string,
    value: string | number | boolean,
    onChange: (v: string) => void,
    type = "text"
  ) {
    return (
      <div className="ed-field">
        <label className="ed-label">{label}</label>
        <input
          className="ed-input"
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="ed-page">
      <div className="ed-page-header">
        <div>
          <div className="ed-breadcrumb">
            <Link href="/editor/lessons" className="ed-bc-link">Lessons</Link>
            <span className="ed-bc-sep">›</span>
            <span>{gradeId.replace("grade","Grade ")}</span>
            <span className="ed-bc-sep">›</span>
            <span>{lessonId}</span>
          </div>
          <h2 className="ed-page-title">{lesson.title}</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {lesson.modules.architectureModule.url ? (
            <a href={lesson.modules.architectureModule.url} target="_blank" rel="noopener noreferrer" className="ed-btn-secondary">
              👁 Preview
            </a>
          ) : (
            // Without a module URL this used to be a "#" link that did nothing.
            <span
              className="ed-btn-secondary"
              aria-disabled="true"
              title="Add an architecture module URL to preview this lesson"
              style={{ opacity: 0.55, cursor: "not-allowed" }}
            >
              👁 Preview
            </span>
          )}
          <Link href={`/editor/lessons?grade=${gradeId}`} className="ed-btn-secondary">← Back</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="ed-tabs">
        <button className={`ed-tab${tab === "form" ? " active" : ""}`} onClick={() => setTab("form")}>
          📋 Form Editor
        </button>
        <button className={`ed-tab${tab === "json" ? " active" : ""}`} onClick={() => setTab("json")}>
          {} Raw JSON
        </button>
      </div>

      {msg && (
        <div className={msg.type === "ok" ? "ed-success-txt" : "ed-error-msg"} style={{ marginBottom: 12 }}>
          {msg.type === "ok" ? "✅" : "⚠️"} {msg.text}
        </div>
      )}

      {/* Form tab */}
      {tab === "form" && (
        <form onSubmit={saveForm}>
          <div className="ed-panel" style={{ marginBottom: 16 }}>
            <div className="ed-panel-header"><span className="ed-panel-title">📄 Basic Info</span></div>
            <div className="ed-panel-body">
              <div className="ed-form-grid">
                {inp("Title",       lesson.title,       (v) => setLesson((l) => l && { ...l, title: v }))}
                {inp("Description", lesson.description, (v) => setLesson((l) => l && { ...l, description: v }))}
                {inp("Chapter ID",  lesson.chapterId,   (v) => setLesson((l) => l && { ...l, chapterId: v }))}
                {inp("Chapter Title", lesson.chapterTitle, (v) => setLesson((l) => l && { ...l, chapterTitle: v }))}
                {inp("Est. Minutes", lesson.estimatedMinutes, (v) => setLesson((l) => l && { ...l, estimatedMinutes: parseInt(v,10)||0 }), "number")}
                {inp("Hero Visualizer Key", lesson.heroVisualizer, (v) => setLesson((l) => l && { ...l, heroVisualizer: v }))}
                <div className="ed-field ed-field-check">
                  <label className="ed-check-label">
                    <input type="checkbox" checked={lesson.locked}
                      onChange={(e) => setLesson((l) => l && { ...l, locked: e.target.checked })} />
                    Locked
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="ed-panel" style={{ marginBottom: 16 }}>
            <div className="ed-panel-header"><span className="ed-panel-title">🔗 Module URLs</span></div>
            <div className="ed-panel-body">
              <div className="ed-form-grid">
                {(["architectureModule","videoLesson","practiceModule","eduNotes"] as const).map((mod) => (
                  <div key={mod} className="ed-field">
                    <label className="ed-label">{mod}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="ed-input" style={{ flex: 1 }}
                        type="url" placeholder="https://…"
                        value={lesson.modules[mod].url}
                        onChange={(e) => setLesson((l) => l && { ...l, modules: { ...l.modules, [mod]: { ...l.modules[mod], url: e.target.value } } })} />
                      <label className="ed-check-label" style={{ flexShrink: 0 }}>
                        <input type="checkbox" checked={lesson.modules[mod].enabled}
                          onChange={(e) => setLesson((l) => l && { ...l, modules: { ...l.modules, [mod]: { ...l.modules[mod], enabled: e.target.checked } } })} />
                        Enabled
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="ed-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "💾 Save Lesson"}
          </button>
        </form>
      )}

      {/* JSON tab */}
      {tab === "json" && (
        <form onSubmit={saveJson}>
          <div className="ed-panel">
            <div className="ed-panel-header">
              <span className="ed-panel-title">{} Raw JSON Editor</span>
              <span className="ed-panel-link" style={{ fontSize: 11 }}>Edit directly — be careful with syntax</span>
            </div>
            <div className="ed-panel-body" style={{ padding: 0 }}>
              <textarea
                className="ed-json-editor"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                spellCheck={false}
                rows={32}
              />
            </div>
          </div>
          <button className="ed-btn-primary" type="submit" disabled={saving} style={{ marginTop: 12 }}>
            {saving ? "Saving…" : "💾 Save JSON"}
          </button>
        </form>
      )}
    </div>
  );
}
