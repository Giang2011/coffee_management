import ax from './axiosClient';

export const getProducts   = (params)     => ax.get('/products', { params });   // ?page=1&search=capu
export const getProduct    = (id)         => ax.get(`/products/${id}`);
export const createProduct = (data)       => ax.post('/products', data);        // form-data => data có thể là FormData
export const updateProduct = (id, data)   => ax.post(`/products/${id}?_method=PUT`, data); // Laravel PUT qua POST
export const deleteProduct = (id)         => ax.delete(`/products/${id}`);
