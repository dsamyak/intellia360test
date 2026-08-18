import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";
import {
  CLASSES, STUDENTS, COURSES, LESSONS, ASSIGNMENTS,
  MESSAGES, RESOURCES, BADGES, TEACHER, XP_RULES,
} from "../data/mockData";

const DataContext = createContext(null);

let idCounter = 1000;
const nextId = (prefix) => `${prefix}-${idCounter++}`;

export function DataProvider({ children }) {
  const [students, setStudents] = useLocalStorage("i360_students_v2", STUDENTS);
  const [assignments, setAssignments] = useLocalStorage("i360_assignments_v2", ASSIGNMENTS);
  const [messages, setMessages] = useLocalStorage("i360_messages_v2", MESSAGES);
  const [attendance, setAttendance] = useLocalStorage("i360_attendance_v2", {}); // { "classId|date": {studentId: status} }
  const [toast, setToast] = useState(null);

  const [notifications, setNotifications] = useLocalStorage("i360_notifications_v2", [
    { id: "n1", title: "New Assignment Submissions", description: "5 students submitted the Fractions Quiz.", type: "quiz", read: false, time: "10m ago", route: "/assignments" },
    { id: "n2", title: "New Parent Message", description: "Mrs. Davis left a message regarding question 4 of homework.", type: "message", read: false, time: "1h ago", route: "/messages" },
    { id: "n3", title: "Curriculum Synchronized", description: "Grade 3 Math chapter list synchronized with server.", type: "system", read: false, time: "3h ago", route: "/lessons" },
    { id: "n4", title: "Weekly Insights Report", description: "Weekly analytics and at-risk students report is ready.", type: "report", read: true, time: "Yesterday", route: "/reports" },
  ]);

  const notify = useCallback((text, tone = "success") => {
    setToast({ text, tone, id: Date.now() });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [setNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const teacher = useMemo(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    return { ...TEACHER, notifications: unreadCount };
  }, [notifications]);

  const classes = useMemo(
    () =>
      CLASSES.map((c) => {
        const roster = students.filter((s) => s.classId === c.id);
        return {
          ...c,
          studentIds: roster.map((s) => s.id),
          avgProgress: roster.length ? Math.round(roster.reduce((a, s) => a + s.progress, 0) / roster.length) : 0,
          avgXp: roster.length ? Math.round(roster.reduce((a, s) => a + s.xp, 0) / roster.length) : 0,
        };
      }),
    [students]
  );

  const addStudent = useCallback((partial) => {
    const id = nextId("s");
    const initials = partial.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    setStudents((prev) => [
      ...prev,
      {
        id,
        name: partial.name,
        initials,
        color: partial.color || "#5B3DF5",
        classId: partial.classId,
        grade: CLASSES.find((c) => c.id === partial.classId)?.grade ?? 3,
        xp: 0,
        coins: 0,
        streak: 0,
        progress: 0,
        status: "on-track",
        weakTopic: "—",
        badges: [],
        lastActive: "Just now",
        parentLinked: false,
      },
    ]);
    return id;
  }, [setStudents]);

  const awardXp = useCallback((studentId, xp, coins = 0, badgeId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              xp: s.xp + xp,
              coins: s.coins + coins,
              badges: badgeId && !s.badges.includes(badgeId) ? [...s.badges, badgeId] : s.badges,
            }
          : s
      )
    );
  }, [setStudents]);

  const addAssignment = useCallback((partial) => {
    const id = nextId("a");
    const roster = students.filter((s) => s.classId === partial.classId);
    setAssignments((prev) => [
      {
        id,
        title: partial.title,
        classId: partial.classId,
        type: partial.type || "Homework",
        due: partial.due || "No due date",
        status: "Not Started",
        submitted: 0,
        total: roster.length,
      },
      ...prev,
    ]);
    return id;
  }, [setAssignments, students]);

  const updateAssignmentStatus = useCallback((id, status) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, [setAssignments]);

  const deleteAssignment = useCallback((id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }, [setAssignments]);



  const sendReply = useCallback((threadId, text) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === threadId
          ? { ...m, unread: false, thread: [...m.thread, { from: "me", text, time: "Just now" }] }
          : m
      )
    );
  }, [setMessages]);

  const markThreadRead = useCallback((threadId) => {
    setMessages((prev) => prev.map((m) => (m.id === threadId ? { ...m, unread: false } : m)));
  }, [setMessages]);

  const setAttendanceFor = useCallback((classId, date, studentId, status) => {
    setAttendance((prev) => {
      const key = `${classId}|${date}`;
      const dayRecord = { ...(prev[key] || {}), [studentId]: status };
      return { ...prev, [key]: dayRecord };
    });
  }, [setAttendance]);

  const value = {
    teacher,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    classes,
    students,
    courses: COURSES,
    lessons: LESSONS,
    assignments,
    messages,
    resources: RESOURCES,
    badges: BADGES,
    xpRules: XP_RULES,
    attendance,
    toast,
    notify,
    addStudent,
    awardXp,
    addAssignment,
    updateAssignmentStatus,
    deleteAssignment,
    sendReply,
    markThreadRead,
    setAttendanceFor,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
