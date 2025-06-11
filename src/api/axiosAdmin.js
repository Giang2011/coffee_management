import axios from 'axios';

/** Axios instance dành riêng cho nhóm /api/admin */
const axiosAdmin = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/admin',
  // KHÔNG set Content-Type ở đây để hỗ trợ FormData
});

/* tự động gắn JWT */
axiosAdmin.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default axiosAdmin;
