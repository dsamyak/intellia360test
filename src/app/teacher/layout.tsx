import React from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="teacher-shell">
      {children}
    </div>
  );
}
