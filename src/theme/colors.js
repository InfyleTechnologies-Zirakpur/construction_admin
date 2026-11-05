/**
 * Brand palette, mirrored from src/index.css `@theme` for JS consumers
 * (Recharts `fill`/`stroke` props, inline styles).
 * Tailwind utilities (bg-primary, text-primary, etc.) should be preferred in JSX.
 */
export const colors = {
  primary: "#ff7a00",
  primaryLight: "#ff9333",
  primarySoft: "#fff7ed",
  primaryBorder: "#fed7aa",

  dark: "#0f172a",
  dark600: "#334155",
  dark700: "#1e293b",
  dark800: "#0f172a",
  dark900: "#020617",

  background: "#f8fafc",
  surface: "#ffffff",
  line: "#e2e8f0",

  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  blue: "#2563eb",
  blueLight: "#60a5fa",
  blueSoft: "#eff6ff",

  success: "#16a34a",
  successSoft: "#f0fdf4",

  warning: "#ea580c",
  warningSoft: "#fff7ed",

  error: "#dc2626",
  errorSoft: "#fef2f2",
};

/** Categorical series colours for charts. */
export const chartSeries = [
  colors.primary,
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#64748b",
];

const STATUS_TONE = {
  active: "success",
  approved: "success",
  accepted: "success",
  completed: "success",
  paid: "success",
  present: "success",
  published: "success",
  verified: "success",
  create: "success",

  pending: "warning",
  review: "warning",
  in_progress: "warning",
  inprogress: "warning",
  processing: "warning",
  on_hold: "warning",
  onhold: "warning",
  partial: "warning",
  warning: "warning",

  rejected: "error",
  blocked: "error",
  failed: "error",
  cancelled: "error",
  expired: "error",
  banned: "error",
  suspended: "error",
  overdue: "error",
  deleted: "error",
  delete: "error",

  login: "warning",

  draft: "neutral",
  inactive: "neutral",
  archived: "neutral",
  open: "info",
  invited: "info",
  assigned: "info",
  shortlisted: "info",
  contacted: "info",
  scheduled: "info",
  update: "info",
  verify: "info",
};

/** Canonical lifecycle statuses -> one of the palette tones. */
export const statusTone = (status) => {
  const key = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return STATUS_TONE[key] ?? "neutral";
};

/**
 * Badge class recipe for a lifecycle status.
 */
export const statusBadgeClass = (status) => {
  switch (statusTone(status)) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
    case "warning":
      return "bg-amber-50 text-amber-700 border border-amber-200/80";
    case "error":
      return "bg-rose-50 text-rose-700 border border-rose-200/80";
    case "info":
      return "bg-orange-50 text-orange-700 border border-orange-200/80";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200/80";
  }
};

const ROLE_TONE = {
  admin: "primary",
  company: "info",
  contractor: "neutral",
  job_seeker: "success",
};

/** Badge class recipe for a user role. */
export const roleBadgeClass = (role) => {
  const tone = ROLE_TONE[String(role ?? "").toLowerCase()];
  switch (tone) {
    case "primary":
      return "bg-orange-50 text-orange-700 border border-orange-200/80";
    case "info":
      return "bg-blue-50 text-blue-700 border border-blue-200/80";
    case "success":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
    case "neutral":
      return "bg-slate-100 text-slate-700 border border-slate-200/80";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200/80";
  }
};
