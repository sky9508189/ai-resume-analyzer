import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
};

export const resumeAPI = {
  upload: (formData) =>
    API.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  analyze: (id) => API.post(`/resumes/${id}/analyze`),
  getAll: () => API.get("/resumes"),
  getById: (id) => API.get(`/resumes/${id}`),
  delete: (id) => API.delete(`/resumes/${id}`),
};

export default API;
