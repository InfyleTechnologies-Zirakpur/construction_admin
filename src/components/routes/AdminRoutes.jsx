import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Companies from "../pages/Companies";
import Contractors from "../pages/Contractors";
import Projects from "../pages/Projects";
import Jobs from "../pages/Jobs";
import Applications from "../pages/Applications";
import Audit from "../pages/Audit";
import Tools from "../pages/Tools";
import Reports from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Roles from "../pages/Roles";

const isAuthenticated = () => !!localStorage.getItem("adminToken");

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/contractors" element={<Contractors />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/roles" element={<Roles />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}