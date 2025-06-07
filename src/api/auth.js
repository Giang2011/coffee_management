import ax from './axiosClient';

export const login = (data)         => ax.post('/login', data);
export const register = (data)      => ax.post('/register', data);
export const logout = ()            => ax.post('/logout');          // JWT blacklist
export const refreshToken = ()      => ax.post('/refresh');         // Nếu backend hỗ trợ
export const getProfile = ()        => ax.get('/me');               // Trả về user hiện tại
