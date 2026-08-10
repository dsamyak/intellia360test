"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStudentContext } from "@/context/StudentContext";
import aiPrompts from "@/data/ai-tutor-prompts.json";

export default function StickyBottomContainer() {
  const { activeLessonData } = useStudentContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    {
      sender: "bot",
      text: `Hi! I'm your Intellia AI Tutor 🤖. Ask me anything about ${activeLessonData?.title || "today's lesson"}!`,
    },
  ]);

  const popupRef = useRef<HTMLDivElement>(null);
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

    // Simulated Bot Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Great question about ${lessonTitle}! "${text}" is an important concept. Let's break it down step-by-step together!`,
        },
      ]);
    }, 600);
  };

  return (
    <div
      id="ai-tutor-floating-container"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {/* Chat Popup Window */}
      {isOpen && (
        <div
          ref={popupRef}
          className="ai-tutor-popup-card"
          style={{
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "460px",
            marginBottom: "14px",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 12px 35px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(37, 99, 235, 0.15)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUpPopup 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, var(--color-primary-hover), var(--color-accent-purple))",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.4rem" }}>🤖</span>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>Intellia AI Tutor</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Topic: {lessonTitle}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
              style={{
                background: "rgba(255,255,255,0.25)",
                border: "none",
                color: "#ffffff",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.85rem",
              }}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "var(--color-bg)",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "var(--color-primary-hover)" : "#ffffff",
                  color: msg.sender === "user" ? "#ffffff" : "var(--color-text-main)",
                  padding: "9px 13px",
                  borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  maxWidth: "84%",
                  fontSize: "0.88rem",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                  lineHeight: "1.4",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Prompt Chips */}
          <div
            style={{
              padding: "8px 10px",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              background: "#ffffff",
              borderTop: "1px solid var(--color-border-light)",
            }}
          >
            {aiPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handleSend(prompt.label)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "5px 10px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-hover)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>{prompt.icon}</span>
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: "8px 12px",
              background: "#ffffff",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={`Ask a question...`}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "var(--color-primary-hover)",
                color: "#ffffff",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Robot Toggle Button */}
      <button
        id="ai-tutor-floating-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Open Intellia AI Tutor"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-accent-orange), var(--color-primary-hover))",
          color: "#ffffff",
          border: "3px solid #ffffff",
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35), 0 4px 10px rgba(0,0,0,0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          transition: "transform 0.2s ease",
        }}
      >
        🤖
      </button>
    </div>
  );
}
