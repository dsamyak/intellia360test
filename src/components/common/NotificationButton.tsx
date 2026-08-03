"use client";
import React from "react";

interface NotificationButtonProps {
  hasUnread?: boolean;
}

export default function NotificationButton({
  hasUnread = true,
}: NotificationButtonProps) {
  const handleClick = () => {
    alert("You have new notifications! Check back later for details.");
  };

  return (
    <button className="icon-button notification-button" aria-label="Notifications" onClick={handleClick}>
      <span className="button-icon">🔔</span>
      {hasUnread && <span className="notification-indicator" />}
    </button>
  );
}
