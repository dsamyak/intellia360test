"use client";

import React from "react";
import { useStudentContext } from "@/context/StudentContext";

interface BottomNavigationContainerProps {
  onPrevious: () => void;
  onNext: () => void;
}

export default function BottomNavigationContainer({
  onPrevious,
  onNext,
}: BottomNavigationContainerProps) {
  const { activeLessonId, curriculum } = useStudentContext();

  const allTopics = curriculum ? curriculum.chapters.flatMap((c) => c.topics) : [];
  const currentIndex = allTopics.findIndex((t) => t.id === activeLessonId);

  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  return (
    <nav className="bottom-navigation-container">
      <div 
        className="nav-prev-card"
        onClick={prevTopic ? onPrevious : undefined}
        style={{ cursor: prevTopic ? "pointer" : "default", opacity: prevTopic ? 1 : 0.5 }}
      >
        <button
          className="nav-circle-btn"
          onClick={onPrevious}
          disabled={!prevTopic}
        >
          ←
        </button>
        <div className="nav-text-group">
          <span className="nav-label">Previous</span>
          <span className="nav-topic-title">{prevTopic ? prevTopic.title : "Start of Chapter"}</span>
        </div>
      </div>

      <div className="quest-path-milestones">
        <span className="milestone-icon">🌱</span>
        <div className="milestone-line" />
        <span className="milestone-icon active">⭐</span>
        <div className="milestone-line dashed" />
        <span className="milestone-icon locked">🔒</span>
      </div>

      <div 
        className="nav-next-card"
        onClick={nextTopic ? onNext : undefined}
        style={{ cursor: nextTopic ? "pointer" : "default", opacity: nextTopic ? 1 : 0.5 }}
      >
        <div className="nav-text-group text-right">
          <span className="nav-label">Next Up</span>
          <span className="nav-topic-title">{nextTopic ? nextTopic.title : "Chapter Complete"}</span>
        </div>
        <button
          className="nav-circle-btn next-btn"
          onClick={onNext}
          disabled={!nextTopic}
        >
          →
        </button>
      </div>
    </nav>
  );
}
