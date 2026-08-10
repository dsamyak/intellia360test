import React from "react";

interface ProfileMenuProps {
  avatarUrl?: string;
  studentName?: string;
}

export default function ProfileMenu({
  avatarUrl = "/assets/avatars/user-student-boy.png",
  studentName = "Student Profile",
}: ProfileMenuProps) {
  return (
    <div className="profile-menu-container">
      <div className="profile-avatar-wrapper">
        <div className="avatar-placeholder" title={studentName}>
          👤
        </div>
      </div>
      <span className="profile-dropdown-arrow">▾</span>
    </div>
  );
}
