"use client";

import React, { useEffect, useRef } from "react";
import { useStudentContext } from "@/context/StudentContext";

const ICON_MAP: Record<string, string> = {
  crown: "👑",
  star: "⭐",
  book: "📖",
  cube: "🧊",
};

export default function TopicList() {
  const { curriculum, activeLessonId, setActiveLessonId, completedLessons } = useStudentContext();
  const activeTopicRef = useRef<HTMLLIElement>(null);
  const [openChapters, setOpenChapters] = React.useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  useEffect(() => {
    if (activeTopicRef.current) {
      activeTopicRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeLessonId]);

  if (!curriculum) return null;

  // Find active chapter
  let currentChapter = curriculum.chapters.find((c) =>
    c.topics.some((t) => t.id === activeLessonId)
  );
  if (!currentChapter && curriculum.chapters.length > 0) {
    currentChapter = curriculum.chapters[0];
  }

  const standaloneTopics = currentChapter?.topics ?? [];

  // All other chapters shown as accordion
  const otherChapters = curriculum.chapters.filter(
    (c) => c.id !== currentChapter?.id
  );

  return (
    <div className="topic-list-container">
      {/* Standalone Topics (from active chapter) */}
      <ul className="standalone-topics-list">
        {standaloneTopics.map((topic) => {
          const isCompleted = completedLessons.includes(topic.id);
          const statusClass = isCompleted ? "completed" : topic.status;
          return (
          <li
            key={topic.id}
            ref={topic.id === activeLessonId ? activeTopicRef : null}
            className={`topic-item topic-${statusClass} ${
              topic.id === activeLessonId ? "active-topic" : ""
            }`}
            onClick={() => {
              if (topic.status !== "locked" && topic.id) {
                setActiveLessonId(topic.id);
              }
            }}
            style={{ cursor: topic.status !== "locked" ? "pointer" : "not-allowed" }}
          >
            <span className="topic-icon">
              {topic.icon ? ICON_MAP[topic.icon] ?? "📌" : "📌"}
            </span>
            <div className="topic-text-group">
              <span className="topic-title">{topic.title}</span>
              {topic.estimatedTime && (
                <span className="topic-questions-count">
                  {topic.estimatedTime}
                </span>
              )}
            </div>
            {topic.status === "locked" && <span className="lock-icon">🔒</span>}
          </li>
        )})}
      </ul>

      {/* Chapters Accordion */}
      <div className="chapters-accordion-group">
        {otherChapters.map((chapter) => (
          <div key={chapter.id} className="chapter-accordion-item">
            <div 
              className="chapter-accordion-header"
              onClick={() => toggleChapter(chapter.id)}
              style={{ cursor: "pointer" }}
            >
              <span className="accordion-chevron" style={{ transform: openChapters[chapter.id] ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
              <span className="chapter-title">
                {chapter.chapterNumber}. {chapter.title}
              </span>
              <span className="chapter-badge-count">{chapter.topicsCount}</span>
            </div>
            {openChapters[chapter.id] && chapter.topics && chapter.topics.length > 0 && (
              <ul className="chapter-subtopics-list">
                {chapter.topics.map((subtopic) => {
                  const isCompleted = completedLessons.includes(subtopic.id);
                  const statusClass = isCompleted ? "completed" : subtopic.status;
                  return (
                  <li
                    key={subtopic.id}
                    ref={subtopic.id === activeLessonId ? activeTopicRef : null}
                    className={`subtopic-item subtopic-${statusClass} ${
                      subtopic.id === activeLessonId ? "active-subtopic" : ""
                    }`}
                    onClick={() => {
                      if (subtopic.status !== "locked" && subtopic.id) {
                        setActiveLessonId(subtopic.id);
                      }
                    }}
                    style={{ cursor: subtopic.status !== "locked" ? "pointer" : "not-allowed" }}
                  >
                    <span className="subtopic-bullet">•</span>
                    <span className="subtopic-title">{subtopic.title}</span>
                    {subtopic.status === "locked" && (
                      <span className="lock-icon">🔒</span>
                    )}
                  </li>
                )})}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
