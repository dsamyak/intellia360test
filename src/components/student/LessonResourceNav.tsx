"use client";

import Link from "next/link";

/**
 * Topic-wise resource switcher shown on every lesson screen.
 *
 * All three destinations carry the same lessonId (and grade when known), so
 * "Videos" and "EduNotes" always open the material for the topic the student
 * is currently on.
 */

export type LessonResourceKey = "lesson" | "video" | "edunotes";

interface LessonResourceNavProps {
  lessonId?: string | null;
  grade?: string | null;
  active: LessonResourceKey;
}

interface ResourceItem {
  key: LessonResourceKey;
  icon: string;
  label: string;
  href: string;
}

export default function LessonResourceNav({
  lessonId,
  grade,
  active,
}: LessonResourceNavProps) {
  const withLesson = (base: string) => {
    const params = new URLSearchParams();
    params.set("lessonId", lessonId ?? "");
    if (grade) params.set("grade", grade);
    return `${base}?${params.toString()}`;
  };

  const items: ResourceItem[] = [
    {
      key: "lesson",
      icon: "🧩",
      label: "Lesson",
      href: `/student/lesson/${encodeURIComponent(lessonId ?? "")}`,
    },
    {
      key: "video",
      icon: "🎬",
      label: "Videos",
      href: withLesson("/student/lesson/video"),
    },
    {
      key: "edunotes",
      icon: "📘",
      label: "EduNotes",
      href: withLesson("/student/lesson/edunotes"),
    },
  ];

  return (
    <nav className="lesson-resource-nav" aria-label="Lesson resources">
      {items.map((item) => {
        const className = `lesson-resource-btn is-${item.key}${
          item.key === active ? " is-active" : ""
        }`;

        // Without a lesson there is nothing topic-wise to open.
        if (!lessonId) {
          return (
            <span
              key={item.key}
              className={`${className} is-disabled`}
              aria-disabled="true"
              title="Open a lesson first"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className={className}
            aria-current={item.key === active ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
