import { apiClient } from "./client";

const unwrap = (promise) => promise.then((response) => response.data);

export const apiError = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const extractList = (payload) => {
  if (!payload) return { items: [], total: 0 };
  const data = payload.data ?? payload;
  if (Array.isArray(data)) {
    return { items: data, total: payload.total ?? data.length };
  }
  if (data && typeof data === "object") {
    const arrayValue = Object.values(data).find(Array.isArray);
    if (arrayValue) {
      return {
        items: arrayValue,
        total: payload.total ?? data.total ?? arrayValue.length,
      };
    }
  }
  return { items: [], total: payload.total ?? data?.total ?? 0 };
};

export const authApi = {
  login: (payload) => unwrap(apiClient.post("/auth/login", payload)),
  me: () => unwrap(apiClient.get("/auth/me")),
};

export const usersApi = {
  list: (params) => unwrap(apiClient.get("/users", { params })),
  get: (id) => unwrap(apiClient.get(`/users/${id}`)),
  update: (id, payload) => unwrap(apiClient.patch(`/users/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/users/${id}`)),
};

export const companiesApi = {
  list: (params) => unwrap(apiClient.get("/companies", { params })),
  get: (id) => unwrap(apiClient.get(`/companies/${id}`)),
  verify: (id, payload) =>
    unwrap(apiClient.patch(`/companies/${id}/verify`, payload)),
};

export const contractorsApi = {
  list: (params) => unwrap(apiClient.get("/contractors", { params })),
  get: (id) => unwrap(apiClient.get(`/contractors/${id}`)),
  verify: (id, payload) =>
    unwrap(apiClient.patch(`/contractors/${id}/verify`, payload)),
};

export const projectsApi = {
  list: (params) => unwrap(apiClient.get("/projects", { params })),
  get: (id) => unwrap(apiClient.get(`/projects/${id}`)),
  update: (id, payload) => unwrap(apiClient.patch(`/projects/${id}`, payload)),
  sites: (projectId) => unwrap(apiClient.get(`/projects/${projectId}/sites`)),
  site: (siteId) => unwrap(apiClient.get(`/sites/${siteId}`)),
};

export const jobsApi = {
  list: (params) => unwrap(apiClient.get("/jobs", { params })),
  get: (id) => unwrap(apiClient.get(`/jobs/${id}`)),
  moderate: (id, payload) =>
    unwrap(apiClient.patch(`/jobs/${id}/moderate`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/jobs/${id}`)),
};

export const postsApi = {
  list: (params) => unwrap(apiClient.get("/posts", { params })),
  get: (id) => unwrap(apiClient.get(`/posts/${id}`)),
  create: (payload) => unwrap(apiClient.post("/posts", payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/posts/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/posts/${id}`)),
  comments: (id, params) => unwrap(apiClient.get(`/posts/${id}/comments`, { params })),
  addComment: (id, payload) => unwrap(apiClient.post(`/posts/${id}/comments`, payload)),
};

export const applicationsApi = {
  list: (params) => unwrap(apiClient.get("/applications", { params })),
  get: (id) => unwrap(apiClient.get(`/applications/${id}`)),
  updateStatus: (id, payload) =>
    unwrap(apiClient.patch(`/applications/${id}/status`, payload)),
};

export const documentsApi = {
  list: (params) => unwrap(apiClient.get("/documents", { params })),
  get: (id) => unwrap(apiClient.get(`/documents/${id}`)),
};

export const auditApi = {
  list: (params) => unwrap(apiClient.get("/audit-logs", { params })),
};

export const siteEngineersApi = {
  list: () => unwrap(apiClient.get("/site-engineers")),
  get: (id) => unwrap(apiClient.get(`/site-engineers/${id}`)),
};

export const reportsApi = {
  projectReports: (projectId, params) =>
    unwrap(apiClient.get(`/projects/${projectId}/reports`, { params })),
  siteReports: (siteId, params) =>
    unwrap(apiClient.get(`/sites/${siteId}/daily-reports`, { params })),
  get: (id) => unwrap(apiClient.get(`/reports/${id}`)),
  updateStatus: (id, payload) =>
    unwrap(apiClient.patch(`/reports/${id}/status`, payload)),
};

export const notificationsApi = {
  mine: (params) => unwrap(apiClient.get("/notifications", { params })),
  adminList: (params) => unwrap(apiClient.get("/notifications/admin", { params })),
  send: (payload) => unwrap(apiClient.post("/notifications/send", payload)),
  markRead: (id) => unwrap(apiClient.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(apiClient.patch("/notifications/read-all")),
};

export const conversationsApi = {
  list: () => unwrap(apiClient.get("/conversations")),
  messages: (id) => unwrap(apiClient.get(`/conversations/${id}/messages`)),
};

export const calculatorsApi = {
  concrete: (params) => unwrap(apiClient.get("/calculators/concrete", { params })),
  cement: (params) => unwrap(apiClient.get("/calculators/cement", { params })),
  sand: (params) => unwrap(apiClient.get("/calculators/sand", { params })),
  aggregate: (params) => unwrap(apiClient.get("/calculators/aggregate", { params })),
  brick: (params) => unwrap(apiClient.get("/calculators/brick", { params })),
  steel: (params) => unwrap(apiClient.get("/calculators/steel", { params })),
  flooring: (params) => unwrap(apiClient.get("/calculators/flooring", { params })),
  paint: (params) => unwrap(apiClient.get("/calculators/paint", { params })),
  plaster: (params) => unwrap(apiClient.get("/calculators/plaster", { params })),
  materialEstimation: (params) =>
    unwrap(apiClient.get("/calculators/material-estimation", { params })),
};