import ax from '../axiosAdmin';

export const getProducts     = (params)       => ax.get ('/products', { params });
export const getProduct      = (id)           => ax.get (`/products/${id}`);

export const createProduct   = (data)         => ax.post('/products/create', data);    // FormData if image
export const updateProduct   = (id, data)     => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    return ax.post(`/products/${id}/edit`, data);
  }
  return ax.put(`/products/${id}/edit`, data);
};
export const deleteProduct   = (id)           => ax.delete(`/products/${id}`);
