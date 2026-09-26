/**
 * Brand palette, mirrored from src/index.css `@theme` for the rare places that
 * need a raw colour value in JS (Recharts `fill`/`stroke` props, inline styles).
 * Everything else should use the Tailwind utilities (bg-primary, text-dark, ...).
 */
export const colors = {
  primary: "#ff7a00",
  primaryLight: "#ff9333",
  primarySoft: "#fff6ed",
  primaryBorder: "#ffd1a3",

  dark: "#1e2a38",
  dark600: "#37485c",
  dark700: "#2a394a",
  dark800: "#1e2a38",
  dark900: "#141d27",
  dark950: "#0b1117",

  background: "#f4f5f7",
  surface: "#ffffff",
  line: "#d7d8d9",

  text: "#1e2a38",
  textSecondary: "#707172",
  textMuted: "#979899",

  blue: "#007bff",
  blueLight: "#3395ff",
  blueSoft: "#e8f3ff",

  success: "#1f9159",
  successSoft: "#edf9f1",

  warning: "#e08600",
  warningSoft: "#fef6e7",

  error: "#d32f2f",
  errorSoft: "#fdeded",
};

/** Categorical series colours for charts. */
export const chartSeries = [
  colors.blue,
  colors.success,
  colors.warning,
  colors.primary,
  colors.dark600,
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
  cancelled: "canceled",
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
 * Badge class recipe for a lifecycle status. Swap this in anywhere a page
 * still carries its own duplicated statusColor()/getStatusStyle() helper.
 */
export const statusBadgeClass = (status) => {
  switch (statusTone(status)) {
    case "success":
      return "bg-success-50 text-success-700 border-success-200";
    case "warning":
      return "bg-warning-50 text-warning-700 border-warning-200";
    case "error":
      return "bg-error-50 text-error-700 border-error-200";
    case "info":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const ROLE_TONE = {
  admin: "error",
  company: "info",
  contractor: "neutral",
  job_seeker: "success",
};

/** Badge class recipe for a user role. */
export const roleBadgeClass = (role) => {
  const tone = ROLE_TONE[String(role ?? "").toLowerCase()];
  switch (tone) {
    case "error":
      return "bg-error-50 text-error-700 border-error-200";
    case "info":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "success":
      return "bg-success-50 text-success-700 border-success-200";
    case "neutral":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};
