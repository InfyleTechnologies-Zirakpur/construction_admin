import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import UserDetails from "../pages/UserDetails";
import Companies from "../pages/Companies";
import CompanyDetails from "../pages/CompanyDetails";
import Contractors from "../pages/Contractors";
import ContractorDetails from "../pages/ContractorDetails";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/JobDetails";
import Applications from "../pages/Applications";
import ApplicationDetails from "../pages/ApplicationDetails";
import Audit from "../pages/Audit";
import Tools from "../pages/Tools";
import Reports from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Roles from "../pages/Roles";
import UserRoleEdit from "../pages/UserRoleEdit";
import Posts from "../pages/Posts";
import PostCreate from "../pages/PostCreate";
import PostDetails from "../pages/PostDetails";
import PostEdit from "../pages/PostEdit";

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

        {/* Users */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetails />} />

        {/* Companies */}
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />

        {/* Contractors */}
        <Route path="/contractors" element={<Contractors />} />
        <Route path="/contractors/:id" element={<ContractorDetails />} />

        {/* Projects */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        {/* Jobs */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Manage Posts */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/create" element={<PostCreate />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/posts/:id/edit" element={<PostEdit />} />

        {/* Applications */}
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:id" element={<ApplicationDetails />} />

        {/* Roles & RBAC */}
        <Route path="/roles" element={<Roles />} />
        <Route path="/roles/user/:id" element={<UserRoleEdit />} />

        {/* Operations, Audit & Tools */}
        <Route path="/tools" element={<Tools />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
