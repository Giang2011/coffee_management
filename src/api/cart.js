import ax from './axiosClient';
export const getMyCart   = ()           => ax.get('/cart-items');
export const addToCart   = (data)       => ax.post('/cart-items', data);        // {product_id, qty}
export const updateItem  = (id, qty)    => ax.put(`/cart-items/${id}`, { qty });
export const deleteItem  = (id)         => ax.delete(`/cart-items/${id}`);
