const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

function getErrorMessage(data) {
  return (
    data?.message ||
    data?.mssg ||
    data?.messg ||
    data?.error ||
    "Something went wrong"
  );
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}

export const authApi = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  currentUser: () => request("/auth/current-user"),
  refreshToken: () => request("/auth/refresh-token", { method: "POST" }),
};

export const projectApi = {
  list: () => request("/projects/"),
  get: (id) => request(`/projects/${id}`),
  create: (body) =>
    request("/projects/", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  members: (projectId) => request(`/projects/${projectId}/members`),
  inviteMember: (projectId, body) =>
    request(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateMemberRole: (projectId, memberId, body) =>
    request(`/projects/${projectId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeMember: (projectId, memberId) =>
    request(`/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    }),
};

export const taskApi = {
  list: (projectId) => request(`/tasks/${projectId}`),
  get: (projectId, taskId) => request(`/tasks/${projectId}/${taskId}`),
  create: (projectId, body) =>
    request(`/tasks/${projectId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (projectId, taskId, body) =>
    request(`/tasks/${projectId}/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (projectId, taskId) =>
    request(`/tasks/${projectId}/${taskId}`, { method: "DELETE" }),
  uploadAttachment: (projectId, taskId, file) => {
    const formData = new FormData();
    formData.append("attachment", file);
    return request(`/tasks/${projectId}/${taskId}/attachment`, {
      method: "POST",
      body: formData,
    });
  },
  deleteAttachment: (projectId, taskId) =>
    request(`/tasks/${projectId}/${taskId}/attachment`, {
      method: "DELETE",
    }),
};
