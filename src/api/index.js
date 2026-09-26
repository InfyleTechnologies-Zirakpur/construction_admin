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
  verify: (id, payload) =>
    unwrap(apiClient.patch(`/contractors/${id}/verify`, payload)),
};

export const projectsApi = {
  list: (params) => unwrap(apiClient.get("/projects", { params })),
  get: (id) => unwrap(apiClient.get(`/projects/${id}`)),
  update: (id, payload) => unwrap(apiClient.patch(`/projects/${id}`, payload)),
  sites: (projectId) => unwrap(apiClient.get(`/projects/${projectId}/sites`)),
};

export const jobsApi = {
  list: (params) => unwrap(apiClient.get("/jobs", { params })),
  get: (id) => unwrap(apiClient.get(`/jobs/${id}`)),
  moderate: (id, payload) =>
    unwrap(apiClient.patch(`/jobs/${id}/moderate`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/jobs/${id}`)),
};

export const applicationsApi = {
  list: (params) => unwrap(apiClient.get("/applications", { params })),
  get: (id) => unwrap(apiClient.get(`/applications/${id}`)),
  updateStatus: (id, payload) =>
    unwrap(apiClient.patch(`/applications/${id}/status`, payload)),
};

export const documentsApi = {
  list: () => unwrap(apiClient.get("/documents")),
};

export const auditApi = {
  list: (params) => unwrap(apiClient.get("/audit-logs", { params })),
};