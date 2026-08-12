"use client";

import React from "react";
import Logo from "./Logo";
import GradeSelector from "./GradeSelector";
import LevelProgress from "./LevelProgress";
import StreakBadge from "./StreakBadge";
import XPBadge from "./XPBadge";
import GemsBadge from "./GemsBadge";
import NotificationButton from "./NotificationButton";
import ProfileMenu from "./ProfileMenu";
import studentProfileData from "@/data/student-profile.json";
import { useStudentContext } from "@/context/StudentContext";

export default function Header() {
  const profile = studentProfileData;
  const { xpPoints, learningGems, streakDays, currentGrade, setCurrentGrade, studentName } = useStudentContext();

  const displayName = studentName && studentName !== "Student Profile" ? studentName : profile.name;

  return (
    <header className="header-container">
      <div className="header-left">
        <Logo />
        <div className="header-user-summary">
          <ProfileMenu avatarUrl={profile.avatar} studentName={displayName} />
          <div className="header-grade-level">
            <GradeSelector currentGrade={currentGrade} onChangeGrade={setCurrentGrade} />
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
