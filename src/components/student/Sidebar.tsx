"use client";

import React from "react";
import CurriculumHeader from "./CurriculumHeader";
import QuestMap from "./QuestMap";
import TopicList from "./TopicList";
import CharacterCollection from "./CharacterCollection";
import { useStudentContext } from "@/context/StudentContext";

export default function Sidebar() {
  const { curriculum, currentGrade } = useStudentContext();

  if (!curriculum) {
    return (
      <aside className="student-sidebar-container">
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#8b8ba7",
          }}
        >
          Loading curriculum...
        </div>
      </aside>
    );
  }

  return (
    <aside className="student-sidebar-container">
      <CurriculumHeader
        title="Math Fundamentals"
        subtitle={currentGrade.toUpperCase()}
      />

      <QuestMap />

      <TopicList />

      <CharacterCollection />
    </aside>
  );
}