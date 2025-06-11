import ax from '../axiosClient';

export const getCart = () => ax.get('/cart');
export const addToCart = (data) => ax.post('/cart', data);
export const updateCartItem = (id, data) => ax.put(`/cart/${id}`, data);
export const removeCartItem = (id) => ax.delete(`/cart/${id}`); 