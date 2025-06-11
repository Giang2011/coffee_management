import ax from './axiosClient';

export const login = (data)         => ax.post('/login', data);
export const register = (data)      => ax.post('/register', data);
export const logout = ()            => ax.post('/logout');          // JWT blacklist
export const refreshToken = ()      => ax.post('/refresh');         // Nếu backend hỗ trợ
export const getProfile = ()        => ax.get('/user');               // Trả về user hiện tại
export const recoverAccount = (email) => ax.get(`/recover-account/${encodeURIComponent(email)}`);
export const recoverAccount2 = (email, security_answer) => ax.post('/recover-account2', { email, security_answer });
export const resetPasswordWithUserId = (user_id, new_password) => ax.post('/reset-password', { user_id, new_password });
