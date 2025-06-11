import ax from './axiosClient';

// Note: getCategories is a public API and does not require authentication.
export const getCategories   = ()                => ax.get('/categories');
export const getCategory     = (id)              => ax.get(`/categories/${id}`);
export const createCategory  = (data)            => ax.post('/categories', data);
export const updateCategory  = (id, data)        => ax.post(`/categories/${id}?_method=PUT`, data);
export const deleteCategory  = (id)              => ax.delete(`/categories/${id}`);
