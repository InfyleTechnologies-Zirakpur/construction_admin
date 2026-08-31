import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";

import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Contractors from "../pages/Contractors";
import Projects from "../pages/Projects";
import Jobs from "../pages/Jobs";
import Tools from "../pages/Tools";
import Reports from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Roles from "../pages/Roles";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/contractors" element={<Contractors />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/roles" element={<Roles />} />
      </Route>
    </Routes>
  );
}