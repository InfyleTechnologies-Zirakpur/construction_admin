// Frontend mirror of backend src/common/permissions/permission-matrix.ts (§10.1).
// Keep in sync: Capability → allowed roles. Admin panel gates UI with `can()`;
// the backend RolesGuard + AuthorizationService remain the real enforcers.
export const ROLES = ["admin", "contractor", "site_engineer", "company", "job_seeker"];

export const MANAGED_ROLES = ["job_seeker", "company", "contractor", "site_engineer"];

export const ROLE_INFO = {
  job_seeker: {
    label: "Job Seeker",
    does: "Applies to jobs, saves jobs, manages own profile and documents.",
    doesNot: "Cannot post jobs, create projects, or view profitability.",
  },
  company: {
    label: "Company",
    does: "Posts jobs, reviews applicants, shortlists and hires.",
    doesNot: "Cannot apply to jobs or create projects/sites.",
  },
  contractor: {
    label: "Contractor",
    does: "Creates projects and sites, assigns engineers, views costing and profitability.",
    doesNot: "Cannot post jobs or apply to jobs.",
  },
  site_engineer: {
    label: "Site Engineer",
    does: "Enters daily labour, material, expense and progress data on assigned sites only.",
    doesNot: "Cannot view project profitability, post jobs, or access unassigned sites.",
  },
};

export const PermissionMatrix = {
  manageUsers: ["admin"],
  createProject: ["admin", "contractor"],
  createSite: ["admin", "contractor"],
  enterDailyData: ["admin", "contractor", "site_engineer"],
  submitDailyReport: ["admin", "contractor", "site_engineer"],
  viewProfitability: ["admin", "contractor"],
  createJob: ["admin", "company"],
  applyJob: ["job_seeker"],
  manageCalculators: ["admin"],
};

export const CAPABILITY_LABELS = {
  manageUsers: "Manage users",
  createProject: "Create project",
  createSite: "Create site",
  enterDailyData: "Enter daily site data",
  submitDailyReport: "Submit daily report",
  viewProfitability: "View project profitability",
  createJob: "Create job",
  applyJob: "Apply for job",
  manageCalculators: "Manage calculators",
};

export const can = (capability, role) =>
  (PermissionMatrix[capability] || []).includes(role);

// Admin panel is admin-only; every capability must include admin.
export const adminHasAll = Object.keys(PermissionMatrix).every((cap) =>
  can(cap, "admin")
);
