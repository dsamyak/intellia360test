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
  const { xpPoints, learningGems, currentGrade, setCurrentGrade } = useStudentContext();

  return (
    <header className="header-container">
      <div className="header-left">
        <Logo />
        <div className="header-user-summary">
          <ProfileMenu avatarUrl={profile.avatar} studentName={profile.name} />
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
        <StreakBadge streakDays={profile.streakDays} />
        <XPBadge xpPoints={xpPoints > 0 ? xpPoints : profile.xpPoints} />
        <GemsBadge learningGems={learningGems > 0 ? learningGems : profile.learningGems} />
        <NotificationButton />
        <ProfileMenu avatarUrl={profile.avatar} studentName={profile.name} />
      </div>
    </header>
  );
}
