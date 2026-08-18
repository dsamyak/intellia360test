import { HashRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MyClasses from "./pages/MyClasses";
import ClassDetail from "./pages/ClassDetail";
import Students from "./pages/Students";
import Lessons from "./pages/Lessons";
import Assignments from "./pages/Assignments";

import Reports from "./pages/Reports";
import Attendance from "./pages/Attendance";
import Rewards from "./pages/Rewards";
import Messages from "./pages/Messages";
import AiAssistant from "./pages/AiAssistant";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<MyClasses />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
            <Route path="/students" element={<Students />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/assignments" element={<Assignments />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}
