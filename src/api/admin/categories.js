import ax from '../axiosAdmin';

export const getCategories   = ()             => ax.get ('/categories');            // GET
export const createCategory  = (data)         => ax.post('/categories/create', data);
export const updateCategory  = (id, data)     => ax.put (`/categories/${id}/edit`, data);
export const deleteCategory  = (id)           => ax.delete(`/categories/${id}`);

