import ax from '../axiosAdmin';

export const getUsers        = (params)       => ax.get ('/users', { params });
export const getUser         = (id)           => ax.get (`/users/${id}`);
export const deleteUser      = (id)           => ax.delete(`/users/${id}`);
export const toggleBlock = (id, blocked)   => ax.post(`/users/${id}/block`, { blocked });
