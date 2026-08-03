"use client";

import React from "react";
import { useStudentContext } from "@/context/StudentContext";
import aiPrompts from "@/data/ai-tutor-prompts.json";

export default function StickyBottomContainer() {
  const { activeLessonData } = useStudentContext();

  const lessonTitle = activeLessonData?.title || "today's lesson";
  const aiContext = activeLessonData?.aiContext || `Ask me anything about ${lessonTitle}!`;

  return (
    <div className="sticky-ai-tutor-container">
      <div className="ai-tutor-mascot">
        <div className="robot-avatar-placeholder" title="Intellia AI Tutor">
          🤖
        </div>
        <div className="ai-tutor-meta">
          <span className="ai-tutor-name">Intellia AI Tutor</span>
          <span className="ai-tutor-hint">{aiContext}</span>
        </div>
      </div>

      <div className="ai-tutor-input-wrapper">
        <input
          type="text"
          className="ai-tutor-input"
          placeholder={`Ask a question about ${lessonTitle}...`}
          readOnly
        />
        <div className="input-actions-group">
          <button className="action-icon-btn" aria-label="Mic">🎤</button>
          <button className="action-icon-btn" aria-label="Attachment">📎</button>
          <button className="send-btn" aria-label="Send">➤</button>
        </div>
      </div>

      <div className="ai-prompt-chips-row">
        {aiPrompts.map((prompt) => (
          <button key={prompt.id} className="prompt-chip">
            <span className="chip-icon">{prompt.icon}</span>
            <span className="chip-label">{prompt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
