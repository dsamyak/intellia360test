"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStudent } from "@/context/StudentContext";

function EduNotesContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const gradeParam = searchParams.get("grade");

  const { currentGrade } = useStudent();
  const effectiveGrade = gradeParam || currentGrade || "grade1";

  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      setAvailable(false);
      return;
    }

    async function checkEduNotes() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/student/edunotes?lessonId=${encodeURIComponent(
            lessonId!
          )}&grade=${encodeURIComponent(effectiveGrade)}`
        );

        if (response.ok) {
          setAvailable(true);
        } else if (response.status === 404) {
          setAvailable(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("EduNotes metadata error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    checkEduNotes();
  }, [lessonId, effectiveGrade]);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Loading EduNotes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Unable to load EduNotes</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (!lessonId) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Lesson ID is missing</h2>
        <p>Please select a lesson to view its EduNotes.</p>
      </div>
    );
  }

  if (!available) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>EduNotes not available</h2>
        <p>Notes for this lesson are not available yet.</p>
      </div>
    );
  }

  const pdfUrl =
    `/api/student/edunotes/content?lessonId=${encodeURIComponent(
      lessonId
    )}&grade=${encodeURIComponent(effectiveGrade)}`;

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      <iframe
        src={pdfUrl}
        title="EduNotes"
        width="100%"
        height="100%"
        style={{
          border: "none",
        }}
        allow="fullscreen"
      />
    </div>
  );
}

export default function EduNotesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h2>Loading EduNotes...</h2>
        </div>
      }
    >
      <EduNotesContent />
    </Suspense>
  );
}