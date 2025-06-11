import ax from '../axiosClient';

export const getProfile = () => ax.get('/user');
export const updateProfile = (data) => ax.put('/user', data);
export const logout = () => ax.post('/logout'); 