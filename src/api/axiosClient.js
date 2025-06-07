import axios from 'axios';

/**
 * Axios base instance – tự thêm JWT, xử lý lỗi chung
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

/* thêm token vào header */
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* gom lỗi về một chuẩn duy nhất */
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Laravel+sanctum gửi 401 / 403 khi hết hạn
    if (error.response?.status === 401) {
      // Tùy app: chuyển sang trang /login
      localStorage.clear();
      window.location.href = '/login';
    }
    // Ném lại lỗi đã rút gọn để service layer xử lý
    return Promise.reject(
      error.response?.data?.message || error.message || 'Có lỗi xảy ra!'
    );
  }
);

export default axiosClient;
