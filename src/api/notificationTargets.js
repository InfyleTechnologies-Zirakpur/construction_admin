// Deep-link map: backend notification event → admin screen.
// referenceId becomes ?focus=<id> so the target row highlights + scrolls into view.
export const NOTIFICATION_TARGETS = {
  new_job: (ref) => `/jobs${ref ? `?focus=${ref}` : ""}`,
  application_update: (ref) => `/applications${ref ? `?focus=${ref}` : ""}`,
  project_assignment: (ref) => `/projects${ref ? `?focus=${ref}` : ""}`,
  project_update: (ref) => `/projects${ref ? `?focus=${ref}` : ""}`,
  site_assignment: (ref) => `/reports${ref ? `?focus=${ref}` : ""}`,
  attendance_event: (ref) => `/reports${ref ? `?focus=${ref}` : ""}`,
  daily_report_submitted: (ref) => `/reports${ref ? `?focus=${ref}` : ""}`,
  admin_announcement: () => null,
};

export const notificationTarget = (notif) => {
  const fn = NOTIFICATION_TARGETS[notif.event];
  if (!fn) return "/dashboard";
  return fn(notif.referenceId) || null;
};
