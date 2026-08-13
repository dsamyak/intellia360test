"use client";

import React from "react";
import { useStudentContext } from "@/context/StudentContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
export default function Header() {
  const profile = studentProfileData;

  const {
    xpPoints,
    learningGems,
    streakDays,
    currentGrade,
    setCurrentGrade,
    studentName,
  } = useStudentContext();

  const { user } = useAuth();

  const displayName =
    studentName && studentName !== "Student Profile"
      ? studentName
      : user?.name || profile.name;

  return (
    <header className="header-container">
      <div className="header-left">
        <Logo />

        <div className="header-user-summary">
          <ProfileMenu
            avatarUrl={profile.avatar}
            studentName={displayName}
          />

          <div className="header-grade-level">
            <GradeSelector
              currentGrade={currentGrade}
              onChangeGrade={setCurrentGrade}
            />

            <LevelProgress
              levelTitle={profile.levelTitle}
              levelNumber={profile.level}
              progressPercentage={profile.levelProgress}
            />
          </div>
        </div>
      </div>

      <div className="header-right">
        <StreakBadge streakDays={streakDays} />
        <GemsBadge learningGems={learningGems} />
        <XPBadge xpPoints={xpPoints} />
        <NotificationButton />

        <ProfileMenu
          avatarUrl={profile.avatar}
          studentName={displayName}
        />
      </div>
    </header>
  );
}