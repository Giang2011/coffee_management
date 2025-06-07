import ax from './axiosClient';

export const getUsers       = (params)           => ax.get('/users', { params });
export const getUser        = (id)               => ax.get(`/users/${id}`);
export const createUser     = (data)             => ax.post('/users', data);
export const updateUser     = (id, data)         => ax.post(`/users/${id}?_method=PUT`, data);
export const deleteUser     = (id)               => ax.delete(`/users/${id}`);
export const toggleActive   = (id, active)       => ax.post(`/users/${id}/activate`, { active });
