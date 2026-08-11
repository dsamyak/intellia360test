"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStudentContext } from "@/context/StudentContext";
import aiPrompts from "@/data/ai-tutor-prompts.json";

interface AIPrompt {
  id: string;
  label: string;
  promptText: string;
  icon?: string;
  color?: string;
}

export default function StickyBottomContainer() {
  const { activeLessonData, xpPoints, learningGems } = useStudentContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    {
      sender: "bot",
      text: `Hi! I'm your Intellia AI Tutor 🤖. Ask me anything about ${activeLessonData?.title || "today's lesson"}!`,
    },
  ]);

  const popupRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lessonTitle = activeLessonData?.title || "today's lesson";

  // Update bot greeting when active lesson changes
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: `Hi! I'm your Intellia AI Tutor 🤖. Ask me anything about ${lessonTitle}!`,
      },
    ]);
  }, [lessonTitle]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        const toggleBtn = document.getElementById("ai-tutor-floating-btn");
        if (toggleBtn && toggleBtn.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    setInputQuery("");
    setIsTyping(true);

    // Simulated Bot Response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Great question about ${lessonTitle}! "${text}" is an important concept. Let's break it down step-by-step together! 🚀`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="ai-tutor-floating-container" id="ai-tutor-floating-container">
      {/* Chat Popup Window */}
      {isOpen && (
        <div ref={popupRef} className="ai-tutor-popup">
          {/* Glassmorphism Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-top">
              <div className="chatbot-header-info">
                {/* 3D Robot Avatar */}
                <div className="chatbot-robot-avatar">
                  <RobotMascotSvg />
                  <span className="online-dot" />
                  <div className="chatbot-robot-sparkles">
                    <span>✨</span>
                    <span>⭐</span>
                    <span>✦</span>
                  </div>
                </div>
                <div className="chatbot-title-group">
                  <h3>
                    Intellia AI Tutor <span style={{ fontSize: "0.8rem" }}>✨</span>
                  </h3>
                  <div className="subtitle">Your 24/7 AI Learning Buddy</div>
                </div>
              </div>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>

            {/* Badges Bar */}
            <div className="chatbot-header-badges">
              <span className="chatbot-badge">🏆 Level 2</span>
              <span className="chatbot-badge">⭐ {xpPoints} XP</span>
              <span className="chatbot-badge">💎 {learningGems} Gems</span>
              <span className="chatbot-badge topic-badge" title={lessonTitle}>
                📌 {lessonTitle}
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                <div className="chat-message-avatar">
                  {msg.sender === "bot" ? "🤖" : "👦"}
                </div>
                <div className="chat-message-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-message-avatar">🤖</div>
                <div className="chat-message-bubble chat-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Cards */}
          <div className="chatbot-actions-grid">
            {(aiPrompts as AIPrompt[]).map((prompt: AIPrompt) => (
              <div
                key={prompt.id}
                className={`chatbot-action-card color-${prompt.color || "blue"}`}
                onClick={() => handleSend(prompt.promptText)}
                role="button"
                tabIndex={0}
              >
                <span className="chatbot-action-icon">{prompt.icon}</span>
                <span className="chatbot-action-label">{prompt.label}</span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                className="chatbot-input"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Ask me anything..."
              />
            </div>
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>

          {/* Sticky Bottom Shortcuts */}
          <div className="chatbot-bottom-shortcuts">
            <div
              className="chatbot-shortcut-chip"
              onClick={() => handleSend("Can you give me a hint for this topic?")}
            >
              💡 Hint
            </div>
            <div
              className="chatbot-shortcut-chip"
              onClick={() => handleSend("Quiz me on this concept!")}
            >
              🎯 Quiz
            </div>
            <div
              className="chatbot-shortcut-chip"
              onClick={() => handleSend("Show me a visual explanation!")}
            >
              📊 Visual
            </div>
            <div
              className="chatbot-shortcut-chip"
              onClick={() => handleSend("Tell me a fun math fact!")}
            >
              🎲 Fun Fact
            </div>
          </div>
        </div>
      )}

      {/* Floating Robot Toggle Button */}
      <button
        id="ai-tutor-floating-btn"
        className="ai-tutor-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Open Intellia AI Tutor"
      >
        <span>🤖</span>
        <span className="notification-badge">1</span>
        <span className="ai-tutor-toggle-label">Chat with Intellia AI Tutor</span>
      </button>
    </div>
  );
}

/* ─── 3D AI Robot Mascot SVG ─── */
function RobotMascotSvg() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
      {/* Antenna */}
      <line x1="18" y1="4" x2="18" y2="8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="3" r="2" fill="#f59e0b" />
      {/* Head */}
      <rect x="6" y="8" width="24" height="18" rx="6" fill="#ffffff" fillOpacity="0.9" />
      {/* Visor/Screen */}
      <rect x="9" y="11" width="18" height="10" rx="3" fill="#1e1b4b" />
      {/* Glowing Eyes */}
      <circle cx="14" cy="16" r="2" fill="#38bdf8" />
      <circle cx="22" cy="16" r="2" fill="#38bdf8" />
      <circle cx="14.5" cy="15.5" r="0.7" fill="#ffffff" />
      <circle cx="22.5" cy="15.5" r="0.7" fill="#ffffff" />
      {/* Mouth Line */}
      <path d="M 15 19 Q 18 21 21 19" stroke="#38bdf8" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <rect x="7" y="15" width="1.5" height="4" rx="0.7" fill="#818cf8" />
      <rect x="27.5" y="15" width="1.5" height="4" rx="0.7" fill="#818cf8" />
      {/* Body top */}
      <path d="M 11 26 L 25 26 L 27 32 L 9 32 Z" fill="#ffffff" fillOpacity="0.8" />
    </svg>
  );
}
